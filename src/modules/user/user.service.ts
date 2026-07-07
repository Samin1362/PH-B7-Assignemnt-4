import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { hashPassword } from "../../utils/password";
import type { UpdateProfileInput } from "./user.interface";

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

const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return user;
};

const updateProfile = async (userId: string, payload: UpdateProfileInput) => {
  const data: UpdateProfileInput = { ...payload };
  if (payload.password) {
    data.password = await hashPassword(payload.password);
  }

  return prisma.user.update({
    where: { id: userId },
    data,
    select: userSelect,
  });
};

export const UserService = { getProfile, updateProfile };
