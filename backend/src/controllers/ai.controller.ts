
import {type Request,type Response } from "express";
import { z } from "zod";

import { generateWithRetry } from "../services/ai.service.js";
import { getRecommendations } from "../services/recommendation.service.js";
import { mergeFilters } from "../utils/filter.utils.js";
import { conversationFiltersSchema } from "../utils/ai-validation.utils.js";

const aiRequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  previousFilters: conversationFiltersSchema.optional(),
}).strict();

export const handleAIChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validation = aiRequestSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Invalid AI search request",
        errors: validation.error.flatten(),
      });
      return;
    }

    const { message, previousFilters } = validation.data;

    // Step 1: Extract changes from the latest message
    const extractedFilters = await generateWithRetry(message);

    // Step 2: Preserve existing conversation context
    const mergedFilters = mergeFilters(
      previousFilters ?? { people: 1 },
      extractedFilters
    );

    // Step 3: Validate the merged result
    const filters = conversationFiltersSchema.parse(
      mergedFilters
    );

    // Step 4: Search and rank matching events
    const recommendations = await getRecommendations(
      filters
    );

    // Step 5: Prepare a response
    const reply =
      recommendations.length > 0
        ? `I found ${recommendations.length} matching event(s) based on your preferences.`
        : "I couldn't find matching events in our sample dataset. Try changing your budget, location, or category.";

    res.status(200).json({
      success: true,
      message,
      reply,
      extractedFilters,
      activeFilters: filters,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    console.error("AI search failed:", error);

    if (error instanceof z.ZodError) {
      res.status(422).json({
        success: false,
        message: "Could not validate the extracted filters",
      });
      return;
    }

    res.status(502).json({
      success: false,
      message: "AI search is temporarily unavailable",
    });
  }
};
