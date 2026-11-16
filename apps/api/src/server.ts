import express from "express";
import { createServer } from "node:http";

export function createApiServer() {
  const app = express();

  // Load Better Auth only when an authentication request is made
  app.all("/api/auth/*path", async (req, res) => {
    try {
      const { auth } = await import("./lib/auth.js");
      const { toNodeHandler } = await import("better-auth/node");

      return toNodeHandler(auth)(req, res);
    } catch (error) {
      console.error("Authentication initialization failed:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Authentication unavailable" });
      }
    }
  });

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  return createServer(app);
}