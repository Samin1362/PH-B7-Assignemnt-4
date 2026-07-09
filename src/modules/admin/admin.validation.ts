import { z } from "zod";

const pagination = {
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
};

export const listUsersQuerySchema = z.object({
  role: z.enum(["CUSTOMER", "PROVIDER", "ADMIN"]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional(),
  search: z.string().optional(),
  ...pagination,
});
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;

export const listGearQuerySchema = z.object({
  categoryId: z.uuid().optional(),
  providerId: z.uuid().optional(),
  search: z.string().optional(),
  ...pagination,
});
export type ListGearQuery = z.infer<typeof listGearQuerySchema>;

export const listRentalsQuerySchema = z.object({
  status: z
    .enum(["PLACED", "CONFIRMED", "PAID", "PICKED_UP", "RETURNED", "CANCELLED"])
    .optional(),
  ...pagination,
});
export type ListRentalsQuery = z.infer<typeof listRentalsQuerySchema>;

export const updateUserSchema = z.object({
  params: z.object({ id: z.uuid("Invalid user id") }),
  body: z.object({
    status: z.enum(["ACTIVE", "SUSPENDED"]),
  }),
});
