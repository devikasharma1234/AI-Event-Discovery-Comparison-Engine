
import { z } from "zod";

export const conversationFiltersSchema = z.object({
  city: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  budget: z.number().min(0).max(10000000).optional(),
  people: z.number().int().min(1).max(50).default(1),
  age: z.number().int().min(0).max(120).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  preferences: z.array(z.string().max(100)).max(20).optional(),
}).strict();
