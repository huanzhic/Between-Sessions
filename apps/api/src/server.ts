import express from "express";
import { createServer } from "node:http";
import type { ErrorRequestHandler, RequestHandler } from "express";
import { currentUser, noStore, requestId, requireUser } from "./auth/middleware.js";
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
  app.get("/auth/session", noStore(), requireUser(resolveSession), (_req, res) => {
    res.json({ user: currentUser(res) });
  });

  app.all("/auth/*path", authHandler);

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use((_req, res) => {
    sendError(res, 404, "not-found", "The requested resource was not found.");
  });

  // Body-parsing errors (bad JSON, too large) carry a safe 4xx status with expose: true.
  // Their messages are not reused, so request content is never echoed back.
  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    const status = err?.expose && err.status >= 400 && err.status < 500 ? err.status : 500;
    if (status === 413) return sendError(res, 413, "too-large", "The request is too large.");
    if (status !== 500)
      return sendError(res, status, "bad-request", "The request could not be read. Please check it and try again.");
    sendError(res, 500, "internal", "Something went wrong. Please try again.");
  };
  app.use(onError);

  return createServer(app);
}
