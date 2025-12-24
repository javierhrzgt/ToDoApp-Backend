import jwt from "jsonwebtoken";
import type { JwtPayload } from "@/types/auth.types";
import { AppError } from "@/middleware/AppError";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

if (JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long");
}

/**
 * Genera un JWT token
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(
    payload,
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: "HS256",
    } as jwt.SignOptions // Type assertion para TypeScript
  );
}

/**
 * Verifica y decodifica un JWT token
 */
export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET,
      {
        algorithms: ["HS256"],
      } as jwt.VerifyOptions // Type assertion para TypeScript
    ) as JwtPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw AppError.unauthorized("Token has expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw AppError.unauthorized("Invalid token");
    }
    throw AppError.unauthorized("Token verification failed");
  }
}
