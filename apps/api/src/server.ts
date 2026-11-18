import express from "express";
import { createServer } from "node:http";
import type { ErrorRequestHandler, RequestHandler } from "express";
import { currentUser, requestId, requireUser } from "./auth/middleware.js";
import { noSession, type SessionResolver } from "./auth/session.js";
import { sendError } from "./http/errors.js";

export type ApiServerOptions = {
  resolveSession?: SessionResolver;
};

export function createApiServer(
  authHandler: RequestHandler,
  { resolveSession = noSession }: ApiServerOptions = {},
) {
  const app = express();

  app.use(requestId());

  // Registered before the Better Auth catch-all so the contract's minimal SessionView wins.
  app.get("/auth/session", requireUser(resolveSession), (_req, res) => {
    res.json({ user: currentUser(res) });
  });

  app.all("/auth/*path", authHandler);

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  const onError: ErrorRequestHandler = (_err, _req, res, _next) => {
    sendError(res, 500, "internal", "Something went wrong. Please try again.");
  };
  app.use(onError);

  return createServer(app);
}
