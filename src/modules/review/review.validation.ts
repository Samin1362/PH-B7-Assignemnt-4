import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    gearItemId: z.uuid("A valid gear id is required"),
    rentalOrderId: z.uuid("A valid rental order id is required"),
    rating: z.number().int().min(1).max(5),
    comment: z.string().trim().max(1000).optional(),
  }),
});

export const gearReviewsSchema = z.object({
  params: z.object({ id: z.uuid("Invalid gear id") }),
});
