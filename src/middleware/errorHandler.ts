import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { AppError } from "./AppError";
import { Prisma } from "@prisma/client";
import { StatusCodes, ReasonPhrases, getReasonPhrase } from "http-status-codes";
import { z } from "zod";

interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message: string = ReasonPhrases.INTERNAL_SERVER_ERROR;
  let errors: Record<string, string[]> | undefined;

  // AppError (errores operacionales)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }

  // Zod Validation Error (Zod 4.x usa z.ZodError y .issues)
  else if (err instanceof z.ZodError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Validation failed";
    errors = {};
    err.issues.forEach((issue) => {
      const path = issue.path.join(".") || "body";
      if (!errors![path]) {
        errors![path] = [];
      }
      errors![path].push(issue.message);
    });
  }

  // Prisma Known Request Error
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": // Unique constraint
        statusCode = StatusCodes.CONFLICT;
        message = "Resource already exists";
        break;
      case "P2025": // Record not found
        statusCode = StatusCodes.NOT_FOUND;
        message = "Resource not found";
        break;
      default:
        message = "Database error";
    }
  }

  // Prisma Validation Error
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = "Invalid data provided";
  }

  // Log del error
  console.error(`[ERROR] ${statusCode} - ${message}:`, err.message);
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }

  const response: ErrorResponse = {
    success: false,
    error: getReasonPhrase(statusCode),
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};