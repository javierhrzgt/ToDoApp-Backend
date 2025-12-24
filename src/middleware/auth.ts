import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/lib/jwt";
import { AppError } from "@/middleware";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw AppError.unauthorized("No authorization header provided");
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      throw AppError.unauthorized(
        "Authorization header format must be: Bearer <token>"
      );
    }

    const token = parts[1];

    const payload = verifyToken(token);

    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuthenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const parts = authHeader.split(" ");

    if (parts.length === 2 && parts[0] === "Bearer") {
      const token = parts[1];
      const payload = verifyToken(token);
      req.user = payload;
    }

    next();
  } catch (error) {
    next();
  }
};
