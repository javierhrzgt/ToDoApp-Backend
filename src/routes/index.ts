import { Router, type IRouter } from "express";
import v1Routes from "@/routes/v1";

const router: IRouter = Router();

router.use("/v1", v1Routes);

export default router;
