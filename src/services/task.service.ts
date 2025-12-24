import { prisma } from "@/lib/prisma";
import { AppError } from "@/middleware";
import { CreateTaskInput, UpdateTaskInput } from "@/types/task.types";

export const taskService = {
  async findAll(userId: number) {
    return prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: number, userId: number) {
    const task = await prisma.task.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!task) {
      throw AppError.notFound("Task");
    }
    return task;
  },

  async create(data: CreateTaskInput, userId: number) {
    return prisma.task.create({
      data: {
        ...data,
        userId,
      },
    });
  },

  async update(id: number, data: UpdateTaskInput, userId: number) {
    await this.findById(id, userId);

    return prisma.task.update({
      where: { id },
      data,
    });
  },

  async delete(id: number, userId: number) {
    await this.findById(id, userId);

    await prisma.task.delete({
      where: { id },
    });
  },
};
