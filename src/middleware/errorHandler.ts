import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '@/middleware/AppError';
import { Prisma } from '@prisma/client';
import { StatusCodes, getReasonPhrase } from 'http-status-codes';
import { z } from 'zod';
import { logger } from '@/lib/logger';

interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  requestId?: string;
  errors?: Record<string, string[]>;
  stack?: string;
}

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';
  let errors: Record<string, string[]> | undefined;

  // AppError (errores operacionales)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  }
  // Zod Validation Error
  else if (err instanceof z.ZodError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Validation failed';
    errors = {};
    err.issues.forEach((issue) => {
      const path = issue.path.join('.') || 'body';
      if (!errors![path]) {
        errors![path] = [];
      }
      errors![path].push(issue.message);
    });
  }
  // Prisma Known Request Error
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        statusCode = StatusCodes.CONFLICT;
        message = 'Resource already exists';
        break;
      case 'P2025':
        statusCode = StatusCodes.NOT_FOUND;
        message = 'Resource not found';
        break;
      default:
        message = 'Database error';
    }
  }
  // Prisma Validation Error
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Invalid data provided';
  }

  // Logging estructurado con Pino
  const logData = {
    requestId: req.id ? String(req.id) : undefined,
    method: req.method,
    url: req.url,
    statusCode,
    message: err.message,
    stack: err.stack,
  };

  if (statusCode >= 500) {
    logger.error(logData, 'Server Error');
  } else {
    logger.warn(logData, 'Client Error');
  }

  const response: ErrorResponse = {
    success: false,
    error: getReasonPhrase(statusCode),
    message,
    requestId: req.id ? String(req.id) : undefined,
  };

  if (errors) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};