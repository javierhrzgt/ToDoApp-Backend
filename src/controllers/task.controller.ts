import { Request, Response, RequestHandler } from "express";
import { taskService } from "@/services/task.service";
import { StatusCodes } from "http-status-codes";
import { asyncHandler, AppError } from "@/middleware";

export const taskController = {
  // GET /tasks
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const tasks = await taskService.findAll();
    res.json({ success: true, data: tasks });
  }) as RequestHandler,

  // GET /tasks/:id
  getById: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const task = await taskService.findById(id);

    if (!task) {
      throw AppError.notFound("Task");
    }
    res.json({ success: true, data: task });
  })  as RequestHandler,

  // POST /tasks
  create: asyncHandler(async (req: Request, res: Response) => {
    const task = await taskService.create(req.body);
    res.status(StatusCodes.CREATED).json({ success: true, data: task });
  })  as RequestHandler,

  // PUT /task/:id
  update: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const task = await taskService.findById(id);

    if (!task) {
      throw AppError.notFound("Task");
    }

    const updatedTask = await taskService.update(id, req.body);
    res.json({ success: true, data: updatedTask });
  }) as RequestHandler,

  // DELETE /task/:id
  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const task = await taskService.findById(id);

    if (!task) {
      throw AppError.notFound("Task");
    }

    await taskService.delete(id);
    res.status(StatusCodes.NO_CONTENT).send();
  }) as RequestHandler,
};
