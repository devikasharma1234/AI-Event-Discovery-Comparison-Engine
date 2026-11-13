
import Event from "../models/event.model.js";

export const getAllEvents = async (
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;

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
  return Event.findById(id).lean();
};
