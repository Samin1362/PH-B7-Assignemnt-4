import type { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import type { GetGearQuery } from "./gear.validation";

const categorySelect = { select: { id: true, name: true } };
const providerSelect = { select: { id: true, name: true } };

const getAll = async (query: GetGearQuery) => {
  const { search, categoryId, brand, minPrice, maxPrice, isAvailable } = query;
  const { page, limit, sortBy, sortOrder } = query;

  const where: Prisma.GearItemWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (brand) {
    where.brand = { equals: brand, mode: "insensitive" };
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.pricePerDay = {
      ...(minPrice !== undefined ? { gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
    };
  }
  if (isAvailable !== undefined) {
    where.isAvailable = isAvailable;
  }

  const [data, total] = await Promise.all([
    prisma.gearItem.findMany({
      where,
      include: { category: categorySelect, provider: providerSelect },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.gearItem.count({ where }),
  ]);

  return { data, meta: { page, limit, total } };
};

const getById = async (id: string) => {
  const gear = await prisma.gearItem.findUnique({
    where: { id },
    include: { category: categorySelect, provider: providerSelect },
  });
  if (!gear) {
    throw new AppError(404, "Gear not found");
  }
  return gear;
};

export const GearService = { getAll, getById };
