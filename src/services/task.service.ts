import { prisma } from "@/lib/prisma";
import { CreateTaskInput, UpdateTaskInput } from "@/types/task.types";

export const taskService = {
  async findAll() {
    return prisma.task.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: number) {
    return prisma.task.findUnique({
      where: { id },
    });
  },

  async create(data: CreateTaskInput) {
    return prisma.task.create({
      data,
    });
  },

  async update(id: number, data: UpdateTaskInput) {
    return prisma.task.update({
      where: { id },
      data,
    });
  },

  async delete(id: number) {
    return prisma.task.delete({
      where: { id },
    });
  },
};
