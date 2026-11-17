import type { Request, Response } from "express";
import { z } from "zod";
import { explainMatches, extractFilters } from "../services/ai.service.js";
import { getRecommendations } from "../services/recommendation.service.js";
import { mergeFilters } from "../utils/filter.utils.js";
import { conversationFiltersSchema } from "../utils/ai-validation.utils.js";

const aiRequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  previousFilters: conversationFiltersSchema.optional(),
  awaitingAge: z.boolean().optional(),
}).strict();

export async function handleAIChat(req: Request, res: Response): Promise<void> {
  const validation = aiRequestSchema.safeParse(req.body);
  if (!validation.success) {
    res.status(400).json({ success: false, message: "Enter a search of up to 1,000 characters." });
    return;
  }

  try {
    const { message, previousFilters, awaitingAge } = validation.data;
    const previous = conversationFiltersSchema.parse(previousFilters ?? {});
    const { filters: extractedFilters, mode } = await extractFilters(message, previous);
    const activeFilters = conversationFiltersSchema.parse(mergeFilters(previous, extractedFilters));
    const common = { success: true, activeFilters, extractedFilters, mode };
    const introducesChild = /\b(under 18|under eighteen|minors?|child(?:ren)?|kids?)\b/i.test(message);
    const adultsOnly = /\b(adults only|no children|no kids)\b/i.test(message);

    if ((awaitingAge || introducesChild || (activeFilters.children ?? 0) > 0) && !adultsOnly && activeFilters.age === undefined) {
      res.json({
        ...common, needsClarification: true, count: 0, recommendations: [],
        reply: "How old is the youngest attendee? I’ll use their age to check event restrictions.",
      });
      return;
    }

    const changed = extractedFilters.clear.length || Object.entries(extractedFilters)
      .some(([key, value]) => key !== "clear" && value !== null);
    if (!changed && !/\b(events?|things to do|show all|what.?s on)\b/i.test(message)) {
      res.json({
        ...common, count: 0, recommendations: [],
        reply: "Try adding a city, event category, date, or budget, such as “Comedy in Chandigarh under ₹1,000.”",
      });
      return;
    }

    const recommendations = await getRecommendations(activeFilters);
    const count = recommendations.length;
    res.json({
      ...common, count, recommendations: mode === "ai" ? await explainMatches(recommendations) : recommendations,
      reply: count
        ? recommendations.some((event) => "isSampleFallback" in event && event.isSampleFallback)
          ? `I found ${count} matching sample ${count === 1 ? "event" : "events"}. No live matches are available for these filters.`
          : `I found ${count} matching ${count === 1 ? "event" : "events"} for your plans.`
        : "I couldn’t find a match with verified details for those filters. Live listings with unknown prices or age limits are excluded when those details are required.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(422).json({ success: false, message: "Check the dates, group size, budget, or age in your request." });
      return;
    }
    console.error("Event search failed:", error);
    res.status(503).json({ success: false, message: "Event search is temporarily unavailable. Try again shortly." });
  }
}
