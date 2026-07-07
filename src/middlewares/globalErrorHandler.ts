import type { ErrorRequestHandler } from "express";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { Prisma } from "../../generated/prisma/client";
import AppError from "../utils/AppError";

const globalErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  let statusCode = 500;
  let message = "Something went wrong";
  let errorDetails: unknown = error;

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errorDetails = { name: error.name };
  } else if (error?.name === "ZodError") {
    statusCode = 400;
    message = "Validation error";
    errorDetails = error.issues;
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      statusCode = 409;
      message = "Duplicate value violates a unique constraint";
      errorDetails = { fields: error.meta?.target };
    } else if (error.code === "P2025") {
      statusCode = 404;
      message = "Record not found";
      errorDetails = { cause: error.meta?.cause };
    } else {
      statusCode = 400;
      message = "Database request error";
      errorDetails = { code: error.code };
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid database query";
    errorDetails = { name: error.name };
  } else if (error instanceof TokenExpiredError) {
    statusCode = 401;
    message = "Token expired";
    errorDetails = { name: error.name };
  } else if (error instanceof JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid token";
    errorDetails = { name: error.name };
  } else if (error instanceof Error) {
    message = error.message;
    errorDetails = { name: error.name };
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails,
  });
};

export default globalErrorHandler;
