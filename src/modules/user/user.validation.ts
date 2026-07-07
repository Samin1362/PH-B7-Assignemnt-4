import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "Name cannot be empty").optional(),
      phone: z.string().optional(),
      password: z.string().min(6, "Password must be at least 6 characters").optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update",
    }),
});
