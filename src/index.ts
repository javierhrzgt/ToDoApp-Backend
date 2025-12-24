import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "@/lib/prisma";
import routes from "@/routes";
import { errorHandler, notFoundHandler } from "@/middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

prisma
  .$connect()
  .then(() => console.log("Database connected"))
  .catch((e) => console.error("Database connected failed", e));
