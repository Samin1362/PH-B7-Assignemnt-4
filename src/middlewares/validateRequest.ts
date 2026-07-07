import type { RequestHandler } from "express";
import type { ZodType } from "zod";
import catchAsync from "../utils/catchAsync";

const validateRequest = (schema: ZodType): RequestHandler =>
  catchAsync(async (req, _res, next) => {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
      cookies: req.cookies,
    });

    if (parsed && typeof parsed === "object" && "body" in parsed) {
      req.body = (parsed as { body: unknown }).body;
    }

    next();
  });

export default validateRequest;
