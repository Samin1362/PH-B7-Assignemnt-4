import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import type { CreateCategoryInput, UpdateCategoryInput } from "./category.interface";

const ensureExists = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    throw new AppError(404, "Category not found");
  }
  return category;
};

const create = async (payload: CreateCategoryInput) => {
  const existing = await prisma.category.findUnique({
    where: { name: payload.name },
  });
  if (existing) {
    throw new AppError(409, "Category name already exists");
  }
  return prisma.category.create({ data: payload });
};

const getAll = async () => {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
};

const update = async (id: string, payload: UpdateCategoryInput) => {
  await ensureExists(id);

  if (payload.name) {
    const duplicate = await prisma.category.findFirst({
      where: { name: payload.name, NOT: { id } },
    });
    if (duplicate) {
      throw new AppError(409, "Category name already exists");
    }
  }

  return prisma.category.update({ where: { id }, data: payload });
};

const remove = async (id: string) => {
  await ensureExists(id);

  const gearCount = await prisma.gearItem.count({ where: { categoryId: id } });
  if (gearCount > 0) {
    throw new AppError(409, "Cannot delete a category that has gear items");
  }

  await prisma.category.delete({ where: { id } });
};

export const CategoryService = { create, getAll, update, remove };
