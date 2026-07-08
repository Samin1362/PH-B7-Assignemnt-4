import { z } from "zod";

export const createRentalSchema = z.object({
  body: z
    .object({
      startDate: z.coerce.date(),
      endDate: z.coerce.date(),
      items: z
        .array(
          z.object({
            gearItemId: z.uuid("A valid gear id is required"),
            quantity: z.number().int().positive().default(1),
          }),
        )
        .min(1, "At least one item is required"),
    })
    .refine((data) => data.endDate > data.startDate, {
      message: "End date must be after start date",
      path: ["endDate"],
    }),
});

export const rentalIdSchema = z.object({
  params: z.object({ id: z.uuid("Invalid rental id") }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({ id: z.uuid("Invalid rental id") }),
  body: z.object({
    status: z.enum(["CONFIRMED", "PICKED_UP", "RETURNED"]),
  }),
});
