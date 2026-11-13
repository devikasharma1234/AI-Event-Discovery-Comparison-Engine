
export const clamp = (
  value: number,
  min: number = 0,
  max: number = 100
): number => {
  return Math.min(Math.max(value, min), max);
};

// Budget compatibility: lower cost = higher score
export const calculateBudgetScore = (
  totalCost: number,
  budget?: number
): number => {
  if (budget === undefined) {
    return 50; // Neutral score when budget isn't given
  }

  if (budget <= 0) {
    return totalCost === 0 ? 100 : 0;
  }

  const remainingRatio = (budget - totalCost) / budget;

  return clamp(50 + remainingRatio * 50);
};

// Convert rating from 0-5 to 0-100
export const calculateRatingScore = (
  rating: number
): number => {
  return clamp((rating / 5) * 100);
};

// Match event tags against user interests
export const calculatePreferenceScore = (
  eventTags: string[],
  preferences: string[] = []
): number => {
  if (preferences.length === 0) {
    return 50; // Neutral score
  }

  const normalizedTags = new Set(
    eventTags.map((tag) => tag.trim().toLowerCase())
  );

  const uniquePreferences = [
    ...new Set(
      preferences.map((p) => p.trim().toLowerCase())
    ),
  ].filter(Boolean);

  if (uniquePreferences.length === 0) {
    return 50;
  }

  const matched = uniquePreferences.filter((preference) =>
    normalizedTags.has(preference)
  ).length;

  return clamp(
    (matched / uniquePreferences.length) * 100
  );
};

// Sooner events receive a higher date score
export const calculateDateScore = (
  eventDate: Date | string
): number => {
  const now = new Date();
  const date = new Date(eventDate);

  const daysUntilEvent =
    (date.getTime() - now.getTime()) /
    (1000 * 60 * 60 * 24);

  if (daysUntilEvent < 0) {
    return 0;
  }

  return clamp(100 - daysUntilEvent * 2);
};
