import express from "express";
import { createServer } from "node:http";
import type { RequestHandler } from "express";

export function createApiServer(authHandler: RequestHandler) {
  const app = express();

  app.all("/auth/*path", authHandler);

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  return createServer(app);
}