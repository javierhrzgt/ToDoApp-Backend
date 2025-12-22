import { Router, type IRouter } from "express";
import taskRoutes from "@/routes/v1/task.routes";

const router: IRouter = Router();

router.use("/tasks", taskRoutes);

export default router;
