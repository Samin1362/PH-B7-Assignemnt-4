import type { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import type {
  ListGearQuery,
  ListRentalsQuery,
  ListUsersQuery,
} from "./admin.validation";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  phone: true,
  createdAt: true,
  updatedAt: true,
};

const getUsers = async (query: ListUsersQuery) => {
  const { role, status, search, page, limit } = query;

  const where: Prisma.UserWhereInput = {};
  if (role) {
    where.role = role;
  }
  if (status) {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: userSelect,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { data, meta: { page, limit, total } };
};

const updateUserStatus = async (
  adminId: string,
  userId: string,
  status: "ACTIVE" | "SUSPENDED",
) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, "User not found");
  }
  if (user.id === adminId) {
    throw new AppError(400, "You cannot change your own account status");
  }

  return prisma.user.update({
    where: { id: userId },
    data: { status },
    select: userSelect,
  });
};

const getGear = async (query: ListGearQuery) => {
  const { categoryId, providerId, search, page, limit } = query;

  const where: Prisma.GearItemWhereInput = {};
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (providerId) {
    where.providerId = providerId;
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.gearItem.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        provider: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.gearItem.count({ where }),
  ]);

  return { data, meta: { page, limit, total } };
};

const getRentals = async (query: ListRentalsQuery) => {
  const { status, page, limit } = query;

  const where: Prisma.RentalOrderWhereInput = {};
  if (status) {
    where.status = status;
  }

  const [data, total] = await Promise.all([
    prisma.rentalOrder.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        items: { include: { gearItem: { select: { id: true, name: true } } } },
        payment: { select: { id: true, status: true, amount: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.rentalOrder.count({ where }),
  ]);

  return { data, meta: { page, limit, total } };
};

export const AdminService = { getUsers, updateUserStatus, getGear, getRentals };
