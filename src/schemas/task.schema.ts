import { z } from "zod";

// Schema para crear tarea
export const createTaskSchema = z.object({
  body: z.object({
    title: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Title is required"
            : "Title must be a string",
      })
      .min(1, "Title cannot be empty")
      .max(255, "Title must be less than 255 characters"),
    description: z
      .string()
      .max(1000, "Description must be less than 1000 characters")
      .optional(),
  }),
});

// Schema para actualizar tarea
export const updateTaskSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(1, "Title cannot be empty")
      .max(255, "Title must be less than 255 characters")
      .optional(),
    description: z
      .string()
      .max(1000, "Description must be less than 1000 characters")
      .nullable()
      .optional(),
    completed: z.boolean().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a number"),
  }),
});

// Schema para params con ID
export const taskIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a number"),
  }),
});

// Tipos inferidos de los schemas
export type CreateTaskInput = z.infer<typeof createTaskSchema>["body"];
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>["body"];
export type TaskIdParam = z.infer<typeof taskIdParamSchema>["params"];
