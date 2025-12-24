import { Router } from "express";
import type { IRouter, Request, Response } from "express";
import { prisma } from "@/lib/prisma";
import { asyncHandler } from "@/middleware";

const router: IRouter = Router();

// GET /health - Health check básico
router.get("/",
  (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

// GET /health/ready - Readiness check (include DB)
router.get(
  "/ready",
  asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ready",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  })
);

export default router;
