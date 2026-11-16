
import { z } from "zod";

export const filterUpdateSchema = z.object({
  city: z.string().max(100).nullable(),
  category: z.string().max(100).nullable(),
  budget: z.number().min(0).max(10000000).nullable(),
  people: z.number().int().min(1).max(50).nullable(),
  children: z.number().int().min(0).max(50).nullable().default(null),
  age: z.number().int().min(0).max(120).nullable(),
  date: z.iso.date().nullable(),
  endDate: z.iso.date().nullable(),
  preferences: z.array(z.string().max(100)).max(20).nullable(),
  clear: z.array(z.enum(["city", "category", "budget", "age", "date", "preferences"])).default([]),
});

export type FilterUpdate = z.infer<
  typeof filterUpdateSchema
>;
