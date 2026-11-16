import express from "express";
import { createServer } from "node:http";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

export function createApiServer() {
  const app = express();

  // Better Auth routes
  app.all("/api/auth/*path", toNodeHandler(auth));

  // JSON parsing for other API routes
  app.use(express.json());

  // Keep the existing health endpoint
  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  return createServer(app);
}