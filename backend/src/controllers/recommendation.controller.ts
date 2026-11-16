import type { Request, Response } from "express";
import { getRecommendations } from "../services/recommendation.service.js";
import { conversationFiltersSchema } from "../utils/ai-validation.utils.js";

export async function fetchRecommendations(req: Request, res: Response): Promise<void> {
  const input = conversationFiltersSchema.safeParse(req.body ?? {});
  if (!input.success) {
    res.status(400).json({ success: false, message: "Check the city, dates, group size, budget, or age in your filters." });
    return;
  }

  try {
    const filters = input.data;
    const recommendations = await getRecommendations(filters);
    res.json({ success: true, count: recommendations.length, filters, recommendations });
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(503).json({ success: false, message: "Event recommendations are temporarily unavailable." });
  }
}
