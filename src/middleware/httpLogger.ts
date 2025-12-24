import pinoHttp from "pino-http";
import { logger } from "@/lib/logger";

// No agregar tipo explícito - dejar que TypeScript infiera
export const httpLogger = pinoHttp({
  logger,
  // Usar type assertion para acceder a propiedad custom
  genReqId: (req) => (req as any).id,
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) return "warn";
    if (res.statusCode >= 500 || err) return "error";
    return "info";
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (req, res, err) => {
    return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
  },
});