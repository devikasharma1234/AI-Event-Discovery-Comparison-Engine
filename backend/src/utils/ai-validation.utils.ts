
import { z } from "zod";

export const conversationFiltersSchema = z.object({
  city: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
  budget: z.number().min(0).max(10000000).optional(),
  people: z.number().int().min(1).max(50).default(1),
  children: z.number().int().min(0).max(50).optional(),
  age: z.number().int().min(0).max(120).optional(),
  date: z.iso.date().optional(),
  endDate: z.iso.date().optional(),
  preferences: z.array(z.string().max(100)).max(20).optional(),
}).strict().refine(
  ({ date, endDate }) => !endDate || Boolean(date && endDate >= date),
  "The end date must be on or after the start date"
).refine(
  ({ people, children }) => children === undefined || children <= people,
  "Children cannot exceed the group size"
).refine(
  ({ children, age }) => !children || age === undefined || age < 18,
  "The youngest attendee must be under 18 when the group includes children"
);
