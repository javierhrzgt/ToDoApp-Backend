import { Request, Response, NextFunction } from "express";
import { taskService } from "@/services/task.service";
import { StatusCodes, ReasonPhrases } from "http-status-codes";

export const taskController = {
  // GET /tasks
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await taskService.findAll();
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  },

  // GET /tasks/:id
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const task = await taskService.findById(id);

      if (!task) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: ReasonPhrases.NOT_FOUND });
      }
      res.json(task);
    } catch (error) {
      next(error);
    }
  },

  // POST /tasks
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.create(req.body);
      res.status(StatusCodes.CREATED).json(task);
    } catch (error) {
      next(error);
    }
  },

  // PUT /task/:id
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const task = await taskService.update(id, req.body);
      res.json(task);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /task/:id
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const task = await taskService.findById(id);
      if (!task) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ error: ReasonPhrases.NOT_FOUND });
      }
      await taskService.delete(id);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  },
};
