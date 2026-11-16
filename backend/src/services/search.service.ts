import Event from "../models/event.model.js";
import type { SearchFilters } from "../types/search.types.js";
import { demoCatalog } from "../data/events.seed.js";

export const searchEvents = async (
  filters: SearchFilters
) => {
  const {
    city,
    category,
    budget,
    people,
    date,
    endDate,
  } = filters;
  const age = filters.age ?? ((filters.children ?? 0) > 0 ? 0 : undefined);

  // Build MongoDB query
  const query: Record<string, unknown> = {};

  // Only upcoming events
  const now = new Date();
  let start = now;
  let end: Date | undefined;

  // Case-insensitive exact city match
  if (city) {
    query.city = {
      $regex: `^${escapeRegex(city)}$`,
      $options: "i",
    };
  }

  // Case-insensitive exact category match
  if (category) {
    query.category = {
      $regex: `^${escapeRegex(category)}$`,
      $options: "i",
    };
  }

  // Age eligibility
  if (age !== undefined) {
    query.minAge = { $lte: age };
  }

  // Optional date filter
  if (date) {
    const midnight = new Date(`${date}T00:00:00+05:30`);
    start = new Date(Math.max(now.getTime(), midnight.getTime()));
    end = new Date(`${endDate ?? date}T00:00:00+05:30`);
    end.setUTCDate(end.getUTCDate() + 1);

    query.date = {
      $gte: start, $lt: end,
    };
  } else {
    query.date = { $gte: start };
  }

  const events = process.env.DEMO_MODE === "true"
    ? demoCatalog.filter((event) =>
      event.date >= start && (!end || event.date < end) &&
      (!city || event.city.toLowerCase() === city.toLowerCase()) &&
      (!category || event.category.toLowerCase() === category.toLowerCase()) &&
      (age === undefined || event.minAge <= age)
    )
    : await Event.find(query).lean();

  const results = events.flatMap((event) => {
    const eligibleListings = event.ticketListings
      .map((listing) => ({
        ...listing,
        totalCost: listing.price * people,
      }))
      .filter(
        (listing) =>
          budget === undefined ||
          listing.totalCost <= budget
      )
      .sort((a, b) => a.totalCost - b.totalCost);

    if (eligibleListings.length === 0) {
      return [];
    }

    return [
      {
        ...event,
        ticketListings: eligibleListings,
        cheapestTotalCost: eligibleListings[0]!.totalCost,
      },
    ];
  });

  results.sort(
    (a, b) =>
      a.cheapestTotalCost - b.cheapestTotalCost
  );

  return results;
};

// Prevent regex special characters in user input
const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
