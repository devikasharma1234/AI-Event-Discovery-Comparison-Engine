import type { Request, Response } from "express";
import { searchEvents } from "../services/search.service.js";
import { conversationFiltersSchema } from "../utils/ai-validation.utils.js";

function numericParameter(value: unknown): unknown {
  if (typeof value !== "string" || !value.trim()) return value;
  return Number(value);
}

export async function fetchSearchResults(req: Request, res: Response): Promise<void> {
  const { city, category, budget, people, children, age, date, endDate } = req.query;
  const input = conversationFiltersSchema.safeParse({
    city, category, date, endDate,
    people: numericParameter(people),
    children: numericParameter(children),
    budget: numericParameter(budget),
    age: numericParameter(age),
  });

  if (!input.success) {
    res.status(400).json({ success: false, message: "Check the city, dates, group size, budget, or age in your filters." });
    return;
  }

  try {
    const filters = input.data;
    const events = await searchEvents(filters);
    res.json({ success: true, count: events.length, filters, events });
  } catch (error) {
    console.error("Search error:", error);
    res.status(503).json({ success: false, message: "Event search is temporarily unavailable." });
  }
}
