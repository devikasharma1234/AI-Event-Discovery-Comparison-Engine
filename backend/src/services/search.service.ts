import Event from "../models/event.model.js";
import type { SearchFilters } from "../types/search.types.js";
import { demoCatalog } from "../data/events.seed.js";
import { enrichLiveEvent, getLiveEvents, usesLiveEvents } from "./live-event.service.js";

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

  if (usesLiveEvents()) {
    if (age !== undefined) return [];
    const live = await getLiveEvents(city);
    const eligible = live.filter((event) => event.date >= start && (!end || event.date < end) &&
      (!category || event.category.toLowerCase() === category.toLowerCase()));
    const priced = [];
    for (let offset = 0; offset < eligible.length; offset += 4) {
      const batch = await Promise.all(eligible.slice(offset, offset + 4).map(async (event) => {
        const details = await enrichLiveEvent(event).catch(() => event);
        const ticketListings = details.ticketListings.map((listing) => ({
          ...listing,
          ...(listing.price !== null ? { totalCost: listing.price * people } : {}),
        })).filter((listing) => budget === undefined || listing.totalCost === undefined || listing.totalCost <= budget);
        const costs = ticketListings.flatMap((listing) => listing.totalCost === undefined ? [] : [listing.totalCost]);
        const hasPublishedPrice = details.startingPrice != null || details.ticketListings.some(({ price }) => price !== null);
        const demoPrice = hasPublishedPrice ? undefined : 250 + (parseInt(event._id.slice(0, 6), 16) % 16) * 50;
        if (demoPrice !== undefined && (budget === undefined || demoPrice * people <= budget)) {
          costs.push(demoPrice * people);
        }
        if (details.startingPrice != null && (budget === undefined || details.startingPrice * people <= budget)) {
          costs.push(details.startingPrice * people);
        }
        return { ...details, ticketListings, demoPrice, cheapestTotalCost: costs.length ? Math.min(...costs) : null };
      }));
      priced.push(...batch.filter((event) => budget === undefined || event.cheapestTotalCost !== null));
    }
    return priced;
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
