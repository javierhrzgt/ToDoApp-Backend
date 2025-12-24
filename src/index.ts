import express from "express";
import type { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import routes from "@/routes";
import healthRoutes from "@/routes/health.routes";
import {
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
  httpLogger,
} from "@/middleware";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

app.use(compression());

app.use(requestIdMiddleware);

app.use(httpLogger);

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/health",healthRoutes);

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

const shutdown = async(signal: string):Promise<void>=>{
  logger.info(`Received ${signal}, shutting down gracefully...`)

  try {
    await prisma.$disconnect()
    logger.info('Database connection closed')
    process.exit(0)
  } catch (error) {
    logger.error(error,'Error during shutdown')
    process.exit(1)
  }
}

process.on('SIGTERM',()=>void shutdown('SIGTERM'))
process.on('SIGINT',()=>void shutdown('SIGINT'))

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

prisma
  .$connect()
  .then(() => console.log("Database connected"))
  .catch((e) => console.error("Database connected failed", e));
