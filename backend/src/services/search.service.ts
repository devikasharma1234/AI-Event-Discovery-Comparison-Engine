import Event from "../models/event.model.js";
import type { SearchFilters } from "../types/search.types.js";

export const searchEvents = async (
  filters: SearchFilters
) => {
  const {
    city,
    category,
    budget,
    people,
    age,
    date,
  } = filters;

  // Build MongoDB query
  const query: Record<string, unknown> = {};

  // Only upcoming events
  query.date = { $gte: new Date() };

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
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    query.date = {
      $gte: start,
      $lt: end,
    };
  }

  const events = await Event.find(query).lean();

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
