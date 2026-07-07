import type { Request } from "express";
import { prisma } from "../lib/prisma";
import AppError from "../utils/AppError";
import catchAsync from "../utils/catchAsync";
import { verifyAccessToken } from "../utils/jwt";
import type { UserRole } from "../../generated/prisma/enums";

const extractToken = (req: Request): string | undefined => {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return req.cookies?.accessToken;
};

export const authenticate = catchAsync(async (req, _res, next) => {
  const token = extractToken(req);
  if (!token) {
    throw new AppError(401, "You are not authorized");
  }

  const decoded = verifyAccessToken(token);
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

  if (!user) {
    throw new AppError(401, "User no longer exists");
  }
  if (user.status === "SUSPENDED") {
    throw new AppError(403, "Your account has been suspended");
  }

  req.user = { userId: user.id, role: user.role };
  next();
});

export const authorize = (...roles: UserRole[]) =>
  catchAsync(async (req, _res, next) => {
    if (!req.user) {
      throw new AppError(401, "You are not authorized");
    }
    if (!roles.includes(req.user.role)) {
      throw new AppError(403, "You do not have permission to access this resource");
    }
    next();
  });
