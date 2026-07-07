import { z } from "zod";

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Category name is required"),
    description: z.string().optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({ id: z.uuid("Invalid category id") }),
  body: z
    .object({
      name: z.string().min(1, "Category name cannot be empty").optional(),
      description: z.string().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update",
    }),
});

export const categoryIdSchema = z.object({
  params: z.object({ id: z.uuid("Invalid category id") }),
});
