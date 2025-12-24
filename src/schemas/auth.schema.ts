import { z } from "zod";

// Schema para signup
export const signupSchema = z.object({
  body: z.object({
    username: z
      .string({ message: "Username is required" })
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be less than 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers and underscores"
      ),
    password: z
      .string({ message: "Password is required" })
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be less than 100 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
  }),
});

// Schema para login (mismas validaciones pero mensajes diferentes)
export const loginSchema = z.object({
  body: z.object({
    username: z
      .string({ message: "Username is required" })
      .min(1, "Username cannot be empty"),
    password: z
      .string({ message: "Password is required" })
      .min(1, "Password cannot be empty"),
  }),
});

// Tipos inferidos
export type SignupInput = z.infer<typeof signupSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
