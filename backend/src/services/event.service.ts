
import Event from "../models/event.model.js";
import { demoCatalog } from "../data/events.seed.js";

export const getAllEvents = async (
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;
  if (process.env.DEMO_MODE === "true") {
    const ordered = [...demoCatalog].sort((a, b) => +a.date - +b.date);
    return {
      events: ordered.slice(skip, skip + limit),
      pagination: { page, limit, total: ordered.length, totalPages: Math.ceil(ordered.length / limit) },
    };
  }

  const [events, total] = await Promise.all([
    Event.find()
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Event.countDocuments(),
  ]);

  return {
    events,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getEventById = async (id: string) => {
  if (process.env.DEMO_MODE === "true") return demoCatalog.find((event) => event._id === id);
  return Event.findById(id).lean();
};
