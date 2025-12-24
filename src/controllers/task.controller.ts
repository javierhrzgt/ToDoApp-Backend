import type { Request, Response, RequestHandler } from "express";
import { taskService } from "@/services/task.service";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "@/middleware";
import type { CreateTaskInput, UpdateTaskInput } from "@/types/task.types";

export const taskController = {
  // GET /tasks
  getAll: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const tasks = await taskService.findAll(userId);

    res.status(StatusCodes.OK).json({ success: true, data: tasks });
  }) as RequestHandler,

  // GET /tasks/:id
  getById: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id, 10);
    const task = await taskService.findById(id, userId);

    res.status(StatusCodes.OK).json({
      success: true,
      data: task,
    });
  }) as RequestHandler,

  // POST /tasks
  create: asyncHandler(
    async (
      req: Request,
      res: Response
    ): Promise<void> => {
      const userId = req.user!.userId;
      const task = await taskService.create(req.body, userId);

      res.status(StatusCodes.CREATED).json({ success: true, data: task });
    }
  ) as RequestHandler,

  // PUT /task/:id
  update: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id, 10);
    const task = await taskService.update(id, req.body, userId);

    res.status(StatusCodes.OK).json({
      success: true,
      data: task,
    });
  }) as RequestHandler,

  // DELETE /task/:id
  delete: asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;
    const id = parseInt(req.params.id, 10);
    await taskService.delete(id, userId);

    res.status(StatusCodes.NO_CONTENT).send();
  }) as RequestHandler,
};
