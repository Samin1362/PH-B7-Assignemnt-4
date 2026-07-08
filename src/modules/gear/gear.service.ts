import type { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import type { CreateGearInput, UpdateGearInput } from "./gear.interface";
import type { GetGearQuery } from "./gear.validation";

const categorySelect = { select: { id: true, name: true } };
const providerSelect = { select: { id: true, name: true } };

const ensureCategoryExists = async (categoryId: string) => {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    throw new AppError(404, "Category not found");
  }
};

const ensureOwnedGear = async (id: string, providerId: string) => {
  const gear = await prisma.gearItem.findUnique({ where: { id } });
  if (!gear) {
    throw new AppError(404, "Gear not found");
  }
  if (gear.providerId !== providerId) {
    throw new AppError(403, "You can only manage your own gear");
  }
  return gear;
};

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

const create = async (providerId: string, payload: CreateGearInput) => {
  await ensureCategoryExists(payload.categoryId);

  return prisma.gearItem.create({
    data: { ...payload, providerId },
    include: { category: categorySelect, provider: providerSelect },
  });
};

const getProviderGear = async (providerId: string) => {
  return prisma.gearItem.findMany({
    where: { providerId },
    include: { category: categorySelect },
    orderBy: { createdAt: "desc" },
  });
};

const update = async (
  id: string,
  providerId: string,
  payload: UpdateGearInput,
) => {
  await ensureOwnedGear(id, providerId);
  if (payload.categoryId) {
    await ensureCategoryExists(payload.categoryId);
  }

  return prisma.gearItem.update({
    where: { id },
    data: payload,
    include: { category: categorySelect, provider: providerSelect },
  });
};

const remove = async (id: string, providerId: string) => {
  await ensureOwnedGear(id, providerId);

  const referenced = await prisma.rentalItem.count({ where: { gearItemId: id } });
  if (referenced > 0) {
    throw new AppError(409, "Cannot delete gear that has rental history");
  }

  await prisma.review.deleteMany({ where: { gearItemId: id } });
  await prisma.gearItem.delete({ where: { id } });
};

export const GearService = {
  getAll,
  getById,
  create,
  getProviderGear,
  update,
  remove,
};
