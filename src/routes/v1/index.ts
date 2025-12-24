import { Router, type IRouter } from "express";
import taskRoutes from "@/routes/v1/task.routes";
import authRoutes from "@/routes/v1/auth.routes";

const router: IRouter = Router();

router.use("/tasks", taskRoutes);
router.use("/auth", authRoutes);

export default router;
