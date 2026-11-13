
import {type Request,type Response } from "express";

import { getRecommendations } from "../services/recommendation.service.js";

import {type RecommendationFilters } from "../types/search.types.js";

export const fetchRecommendations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      city,
      category,
      budget,
      people,
      age,
      date,
      preferences,
    } = req.body ?? {};

    if (
      typeof people !== "number" ||
      !Number.isSafeInteger(people) ||
      people < 1 ||
      people > 50
    ) {
      res.status(400).json({
        success: false,
        message: "people must be an integer between 1 and 50",
      });
      return;
    }

    if (
      budget !== undefined &&
      (typeof budget !== "number" ||
        !Number.isFinite(budget) ||
        budget < 0 ||
        budget > 10000000)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid budget",
      });
      return;
    }

    if (
      age !== undefined &&
      (typeof age !== "number" ||
        !Number.isSafeInteger(age) ||
        age < 0 ||
        age > 120)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid age",
      });
      return;
    }

    if (
      [city, category].some(
        (value) =>
          value !== undefined &&
          (typeof value !== "string" || value.length > 100)
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid city or category",
      });
      return;
    }

    if (
      preferences !== undefined &&
      (!Array.isArray(preferences) ||
        preferences.length > 20 ||
        preferences.some(
          (value) =>
            typeof value !== "string" ||
            value.length > 100
        ))
    ) {
      res.status(400).json({
        success: false,
        message: "preferences must be an array of strings",
      });
      return;
    }

    if (date !== undefined) {
      if (
        typeof date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date)
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD",
        });
        return;
      }

      const parsed = new Date(`${date}T00:00:00.000Z`);

      if (
        Number.isNaN(parsed.getTime()) ||
        parsed.toISOString().slice(0, 10) !== date
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid calendar date",
        });
        return;
      }
    }

    const filters: RecommendationFilters = {
      city: city?.trim(),
      category: category?.trim(),
      budget,
      people,
      age,
      date,
      preferences: preferences?.map((p: string) =>
        p.trim()
      ),
    };

    const recommendations = await getRecommendations(filters);

    res.status(200).json({
      success: true,
      count: recommendations.length,
      filters,
      recommendations,
    });
  } catch (error) {
    console.error("Recommendation error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate recommendations",
    });
  }
};
