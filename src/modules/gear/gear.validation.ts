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

export const createGearSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    brand: z.string().optional(),
    pricePerDay: z.number().positive("Price per day must be greater than 0"),
    stock: z.number().int().nonnegative().optional(),
    images: z.array(z.string()).optional(),
    isAvailable: z.boolean().optional(),
    categoryId: z.uuid("A valid category id is required"),
  }),
});

export const updateGearSchema = z.object({
  params: z.object({ id: z.uuid("Invalid gear id") }),
  body: z
    .object({
      name: z.string().min(1, "Name cannot be empty").optional(),
      description: z.string().optional(),
      brand: z.string().optional(),
      pricePerDay: z.number().positive("Price per day must be greater than 0").optional(),
      stock: z.number().int().nonnegative().optional(),
      images: z.array(z.string()).optional(),
      isAvailable: z.boolean().optional(),
      categoryId: z.uuid("A valid category id is required").optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update",
    }),
});
