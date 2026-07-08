import { z } from "zod";

export const createPaymentSchema = z.object({
  body: z.object({
    rentalOrderId: z.uuid("A valid rental order id is required"),
  }),
});

export const paymentIdSchema = z.object({
  params: z.object({ id: z.uuid("Invalid payment id") }),
});
