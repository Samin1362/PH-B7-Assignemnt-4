import { prisma } from "../../lib/prisma";
import AppError from "../../utils/AppError";
import { signAccessToken, signRefreshToken } from "../../utils/jwt";
import { comparePassword, hashPassword } from "../../utils/password";
import type { LoginInput, RegisterInput } from "./auth.interface";

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

const register = async (payload: RegisterInput) => {
  const existing = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (existing) {
    throw new AppError(409, "Email is already registered");
  }

  const password = await hashPassword(payload.password);

  return prisma.user.create({
    data: { ...payload, password },
    select: userSelect,
  });
};

const login = async (payload: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }
  if (user.status === "SUSPENDED") {
    throw new AppError(403, "Your account has been suspended");
  }

  const matched = await comparePassword(payload.password, user.password);
  if (!matched) {
    throw new AppError(401, "Invalid email or password");
  }

  const tokenPayload = { userId: user.id, role: user.role };
  const accessToken = signAccessToken(tokenPayload);
  const refreshToken = signRefreshToken(tokenPayload);

  const { password, ...safeUser } = user;
  return { accessToken, refreshToken, user: safeUser };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return user;
};

export const AuthService = { register, login, getMe };
