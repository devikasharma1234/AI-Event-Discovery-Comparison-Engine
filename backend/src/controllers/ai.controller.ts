
import {type Request,type Response } from "express";
import { z } from "zod";

import { extractFilters } from "../services/ai.service.js";
import { getRecommendations } from "../services/recommendation.service.js";
import { mergeFilters } from "../utils/filter.utils.js";
import { conversationFiltersSchema } from "../utils/ai-validation.utils.js";
import {type RecommendationFilters } from "../types/search.types.js";

const aiRequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  previousFilters: conversationFiltersSchema.optional(),
}).strict();

export const handleAIChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // 1. Validate incoming request
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

    // 2. Extract updates using Gemini
    const extractedFilters = await extractFilters(message);

    // 3. Build previous filters without undefined fields
    const previous: RecommendationFilters = {
      people: previousFilters?.people ?? 1,
      ...(previousFilters?.city !== undefined && {
        city: previousFilters.city,
      }),
      ...(previousFilters?.category !== undefined && {
        category: previousFilters.category,
      }),
      ...(previousFilters?.budget !== undefined && {
        budget: previousFilters.budget,
      }),
      ...(previousFilters?.age !== undefined && {
        age: previousFilters.age,
      }),
      ...(previousFilters?.date !== undefined && {
        date: previousFilters.date,
      }),
      ...(previousFilters?.preferences !== undefined && {
        preferences: previousFilters.preferences,
      }),
    };

    // 4. Merge conversation context
    const mergedFilters = mergeFilters(
      previous,
      extractedFilters
    );

    // 5. Validate merged filters
    const parsedFilters =
      conversationFiltersSchema.parse(mergedFilters);

    const filters: RecommendationFilters = {
      people: parsedFilters.people,
      ...(parsedFilters.city !== undefined && {
        city: parsedFilters.city,
      }),
      ...(parsedFilters.category !== undefined && {
        category: parsedFilters.category,
      }),
      ...(parsedFilters.budget !== undefined && {
        budget: parsedFilters.budget,
      }),
      ...(parsedFilters.age !== undefined && {
        age: parsedFilters.age,
      }),
      ...(parsedFilters.date !== undefined && {
        date: parsedFilters.date,
      }),
      ...(parsedFilters.preferences !== undefined && {
        preferences: parsedFilters.preferences,
      }),
    };

    // 6. Check if child's age needs clarification
    const mentionsUnder18 =
      /\b(under 18|under eighteen|minor|child|kid)\b/i.test(
        message
      );

    if (mentionsUnder18 && filters.age === undefined) {
      res.status(200).json({
        success: true,
        needsClarification: true,
        reply:
          "What is the age of the youngest child? I need it to check event age restrictions.",
        activeFilters: filters,
        extractedFilters,
        count: 0,
        recommendations: [],
      });
      return;
    }

    // 7. Get ranked recommendations
    const recommendations = await getRecommendations(
      filters
    );

    const reply =
      recommendations.length > 0
        ? `I found ${recommendations.length} matching event(s) based on your preferences.`
        : "I couldn't find matching events in our sample dataset. Try changing your budget, location, or category.";

    // 8. Send response
    res.status(200).json({
      success: true,
      needsClarification: false,
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
