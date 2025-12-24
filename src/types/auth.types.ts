import type { User } from "@prisma/client";

export interface JwtPayload {
  userId: number;
  username: string;
}

export type UserResponse = Omit<User, "password">;

export interface SignupInput {
  username: string;
  password: string;
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
