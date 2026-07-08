import { z } from "zod";

export const getGearQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.uuid().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  isAvailable: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.enum(["createdAt", "pricePerDay", "name"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type GetGearQuery = z.infer<typeof getGearQuerySchema>;

export const gearIdSchema = z.object({
  params: z.object({ id: z.uuid("Invalid gear id") }),
});
