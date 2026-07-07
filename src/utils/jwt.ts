import jwt, { type SignOptions } from "jsonwebtoken";
import config from "../config";
import type { UserRole } from "../../generated/prisma/enums";

export type JwtPayload = {
  userId: string;
  role: UserRole;
};

const signToken = (payload: JwtPayload, secret: string, expiresIn: string) =>
  jwt.sign(payload, secret, { expiresIn } as SignOptions);

export const signAccessToken = (payload: JwtPayload): string =>
  signToken(
    payload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

export const signRefreshToken = (payload: JwtPayload): string =>
  signToken(
    payload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

export const verifyAccessToken = (token: string): JwtPayload =>
  jwt.verify(token, config.jwt_access_secret as string) as JwtPayload;

export const verifyRefreshToken = (token: string): JwtPayload =>
  jwt.verify(token, config.jwt_refresh_secret as string) as JwtPayload;
