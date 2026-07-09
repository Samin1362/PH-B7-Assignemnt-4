import type { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";

type Hit = { count: number; resetAt: number };

const rateLimit = (options: { windowMs: number; max: number }) => {
  const hits = new Map<string, Hit>();

  return (req: Request, _res: Response, next: NextFunction) => {
    const key = req.ip ?? "unknown";
    const now = Date.now();
    const hit = hits.get(key);

    if (!hit || hit.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    hit.count += 1;
    if (hit.count > options.max) {
      return next(
        new AppError(429, "Too many requests, please try again later"),
      );
    }

    next();
  };
};

export default rateLimit;
