
import {type Request,type Response } from "express";
import { searchEvents } from "../services/search.service.js";
import {type SearchFilters } from "../types/search.types.js";

const parseNumber = (
  value: unknown
): number | undefined => {
  if (typeof value !== "string" || value.trim() === "") {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
};

export const fetchSearchResults = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { city, category, budget, people, age, date } =
      req.query;

    const stringFields = [city, category, date];

    if (
      stringFields.some(
        (value) =>
          value !== undefined &&
          (typeof value !== "string" || value.length > 100)
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid search parameters",
      });
      return;
    }

    const rawNumeric = [budget, people, age];

    if (
      rawNumeric.some(
        (value) =>
          value !== undefined &&
          (typeof value !== "string" ||
            value.trim() === "" ||
            !Number.isFinite(Number(value)))
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid numeric parameters",
      });
      return;
    }

    const parsedPeople = parseNumber(people) ?? 1;
    const parsedBudget = parseNumber(budget);
    const parsedAge = parseNumber(age);

    if (
      !Number.isSafeInteger(parsedPeople) ||
      parsedPeople < 1 ||
      parsedPeople > 50 ||
      (parsedBudget !== undefined &&
        (parsedBudget < 0 || parsedBudget > 10000000)) ||
      (parsedAge !== undefined &&
        (!Number.isSafeInteger(parsedAge) ||
          parsedAge < 0 ||
          parsedAge > 120))
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid budget, people, or age",
      });
      return;
    }

    const dateString =
      typeof date === "string" ? date : undefined;

    if (dateString) {
      const validFormat = /^\d{4}-\d{2}-\d{2}$/.test(dateString);
      const parsedDate = new Date(
        `${dateString}T00:00:00.000Z`
      );

      if (
        !validFormat ||
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== dateString
      ) {
        res.status(400).json({
          success: false,
          message: "Date must be a valid YYYY-MM-DD date",
        });
        return;
      }
    }

    const filters: SearchFilters = {
      city: typeof city === "string" ? city.trim() : undefined,
      category:
        typeof category === "string"
          ? category.trim()
          : undefined,
      budget: parsedBudget,
      people: parsedPeople,
      age: parsedAge,
      date: dateString,
    };

    const results = await searchEvents(filters);

    res.status(200).json({
      success: true,
      count: results.length,
      filters,
      events: results,
    });
  } catch (error) {
    console.error("Search error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to search events",
    });
  }
};
