
import { z } from "zod";

export const filterUpdateSchema = z.object({
  city: z.string().max(100).nullable(),
  category: z.string().max(100).nullable(),
  budget: z.number().min(0).max(10000000).nullable(),
  people: z.number().int().min(1).max(50).nullable(),
  age: z.number().int().min(0).max(120).nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  preferences: z.array(z.string().max(100)).max(20).nullable(),
});

export type FilterUpdate = z.infer<
  typeof filterUpdateSchema
>;
