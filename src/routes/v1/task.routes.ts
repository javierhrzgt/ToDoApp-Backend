import { Router, type IRouter } from "express";
import { taskController } from "@/controllers/task.controller";

const router: IRouter = Router();

router.get("/", taskController.getAll);
router.get("/:id", taskController.getById);
router.post("/", taskController.create);
router.put("/:id", taskController.update);
router.patch("/:id", taskController.update);
router.delete("/:id", taskController.delete);

export default router;
