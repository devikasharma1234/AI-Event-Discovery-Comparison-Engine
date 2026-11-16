
import {
 type RecommendationFilters,
} from "../types/search.types.js";

import {type FilterUpdate } from "../types/ai.types.js";

export const mergeFilters = (
  previous: RecommendationFilters,
  updates: FilterUpdate
): RecommendationFilters => {
  const merged: RecommendationFilters = {
    ...previous,
  };

  for (const key of updates.clear) {
    delete merged[key];
    if (key === "date") delete merged.endDate;
  }

  if (updates.city !== null) {
    merged.city = updates.city;
  }

  if (updates.category !== null) {
    merged.category = updates.category;
  }

  if (updates.budget !== null) {
    merged.budget = updates.budget;
  }

  if (updates.people !== null) {
    merged.people = updates.people;
  }

  if (updates.children !== null) {
    if (updates.children !== merged.children) delete merged.age;
    merged.children = updates.children;
  }

  if (updates.age !== null) {
    merged.age = updates.age;
  }

  if (updates.date !== null) {
    merged.date = updates.date;
    delete merged.endDate;
  }

  if (updates.endDate !== null) merged.endDate = updates.endDate;

  if (updates.preferences !== null) {
    merged.preferences = updates.preferences;
  }

  return merged;
};
