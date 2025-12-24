import { Router, type IRouter } from "express";
import { taskController } from "@/controllers/task.controller";
import { validate } from "@/middleware";
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamSchema,
} from "@/schemas/task.schema";

const router: IRouter = Router();

router.get("/", taskController.getAll);
router.get("/:id", validate(taskIdParamSchema), taskController.getById);
router.post("/", validate(createTaskSchema), taskController.create);
router.put("/:id", validate(updateTaskSchema), taskController.update);
router.patch("/:id", validate(updateTaskSchema), taskController.update);
router.delete("/:id", validate(taskIdParamSchema), taskController.delete);

export default router;
