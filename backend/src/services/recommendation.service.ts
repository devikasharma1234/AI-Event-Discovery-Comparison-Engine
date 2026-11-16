
import { searchEvents } from "./search.service.js";

import {
  type RecommendationFilters,
  type RecommendationScores,
} from "../types/search.types.js";

import {
  calculateBudgetScore,
  calculateRatingScore,
  calculatePreferenceScore,
  calculateDateScore,
} from "../utils/recommendation.utils.js";

const WEIGHTS = {
  budget: 0.30,
  rating: 0.25,
  preference: 0.30,
  date: 0.15,
};

export const getRecommendations = async (
  filters: RecommendationFilters
) => {
  // Reuse Phase 3 filtering
  const eligibleEvents = await searchEvents(filters);

  const recommendations = eligibleEvents.map((event) => {
    const budgetScore = calculateBudgetScore(
      event.cheapestTotalCost ?? 0,
      filters.budget
    );

    const ratingScore = event.rating === null ? 50 : calculateRatingScore(event.rating);

    const preferenceScore = calculatePreferenceScore(
      event.tags,
      filters.preferences
    );

    const dateScore = calculateDateScore(event.date);

    const totalScore =
      budgetScore * WEIGHTS.budget +
      ratingScore * WEIGHTS.rating +
      preferenceScore * WEIGHTS.preference +
      dateScore * WEIGHTS.date;

    const scores: RecommendationScores = {
      budget: Math.round(budgetScore),
      rating: Math.round(ratingScore),
      preference: Math.round(preferenceScore),
      date: Math.round(dateScore),
      total: Math.round(totalScore),
    };

    const explanation = generateExplanation(
      event.title,
      scores,
      event.cheapestTotalCost,
      filters,
      "demoPrice" in event && typeof event.demoPrice === "number"
    );

    return {
      ...event,
      recommendationScore: scores.total,
      scoreBreakdown: scores,
      scoreWeights: WEIGHTS,
      explanation,
    };
  });

  // Highest recommendation score first
  recommendations.sort(
    (a, b) =>
      b.recommendationScore - a.recommendationScore ||
      (a.cheapestTotalCost ?? Infinity) - (b.cheapestTotalCost ?? Infinity)
  );

  return recommendations;
};

const generateExplanation = (
  title: string,
  scores: RecommendationScores,
  totalCost: number | null,
  filters: RecommendationFilters,
  demoPrice: boolean
): string => {
  const reasons: string[] = [];

  if (filters.budget !== undefined && totalCost !== null) {
    reasons.push(
      `The ${demoPrice ? "demo" : "estimated"} group total is ₹${totalCost}, within your ₹${filters.budget} budget.`
    );
  }

  if (
    filters.preferences?.length &&
    scores.preference > 0
  ) {
    reasons.push("It matches some of your event interests.");
  }

  if (scores.rating >= 80) {
    reasons.push("It has a high sample event rating.");
  }

  if (scores.date >= 80) {
    reasons.push("It’s scheduled relatively soon.");
  }

  if (reasons.length === 0) {
    return `${title} satisfies your selected search constraints.`;
  }

  return reasons.slice(0, 2).join(" ");
};
