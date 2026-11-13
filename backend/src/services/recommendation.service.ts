
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
      event.cheapestTotalCost,
      filters.budget
    );

    const ratingScore = calculateRatingScore(event.rating);

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
      filters
    );

    return {
      ...event,
      recommendationScore: scores.total,
      scoreBreakdown: scores,
      explanation,
    };
  });

  // Highest recommendation score first
  recommendations.sort(
    (a, b) =>
      b.recommendationScore - a.recommendationScore ||
      a.cheapestTotalCost - b.cheapestTotalCost
  );

  return recommendations;
};

const generateExplanation = (
  title: string,
  scores: RecommendationScores,
  totalCost: number,
  filters: RecommendationFilters
): string => {
  const reasons: string[] = [];

  if (filters.budget !== undefined) {
    reasons.push(
      `Estimated group ticket cost is ₹${totalCost}, within your ₹${filters.budget} budget`
    );
  }

  if (
    filters.preferences?.length &&
    scores.preference > 0
  ) {
    reasons.push("Matches some of your event interests");
  }

  if (scores.rating >= 80) {
    reasons.push("Has a high sample event rating");
  }

  if (scores.date >= 80) {
    reasons.push("Is scheduled relatively soon");
  }

  if (reasons.length === 0) {
    return `${title} satisfies your selected search constraints.`;
  }

  return `${title} is recommended because it ${reasons.join(
    ", "
  )}.`;
};
