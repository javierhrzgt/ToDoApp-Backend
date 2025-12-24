import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/middleware";
import { signToken } from "@/lib/jwt";
import type {
  SignupInput,
  LoginInput,
  AuthResponse,
  UserResponse,
} from "@/types/auth.types";

const SALT_ROUNDS = 12;

function excludePassword(user: any): UserResponse {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export const userService = {
  async signup(data: SignupInput): Promise<AuthResponse> {
    const { username, password } = data;

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      throw AppError.conflict("Username already exists");
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    const token = signToken({
      userId: user.id,
      username: user.username,
    });

    return {
      user: excludePassword(user),
      token,
    };
  },

  async login(data: LoginInput): Promise<AuthResponse> {
    const { username, password } = data;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw AppError.unauthorized("Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw AppError.unauthorized("Invalid credentials");
    }
    const token = signToken({
      userId: user.id,
      username: user.username,
    });

    return {
      user: excludePassword(user),
      token,
    };
  },

  async getById(userId: number): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw AppError.notFound("User not found");
    }

    return excludePassword(user);
  },
};
