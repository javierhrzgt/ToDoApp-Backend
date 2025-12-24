import { Router } from "express";
import type { IRouter } from "express";
import { userController } from "@/controllers/user.controller";
import { validate, authenticate } from "@/middleware";
import { signupSchema, loginSchema } from "@/schemas/auth.schema";

const router: IRouter = Router();

router.post("/signup", validate(signupSchema), userController.signup);
router.post("/login", validate(loginSchema), userController.login);
router.get("/me", authenticate, userController.me);

export default router;
