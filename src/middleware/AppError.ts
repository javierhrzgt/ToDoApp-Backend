export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errors?: Record<string, string[]>;

  constructor(
    message: string,
    statusCode: number = 500,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    // Mantener el stack trace correcto
    Error.captureStackTrace(this, this.constructor);
  }

  // Factory methods para errores comunes
  static badRequest(message: string, errors?: Record<string, string[]>) {
    return new AppError(message, 400, errors);
  }

  static notFound(resource: string = "Resource") {
    return new AppError(`${resource} not found`, 404);
  }

  static unauthorized(message: string = "Unauthorized") {
    return new AppError(message, 401);
  }

  static conflict(message: string) {
    return new AppError(message, 409);
  }
}
