import express from "express";
import { createServer } from "node:http";
import type { ErrorRequestHandler, RequestHandler } from "express";
import { currentUser, requestId, requireUser } from "./auth/middleware.js";
import { noSession, type SessionResolver } from "./auth/session.js";
import { sendError } from "./http/errors.js";
import { createDraftRoutes } from "./drafts/routes.js";
import type { createDraftRepository } from "./drafts/repository.js";

export type ApiServerOptions = {
  resolveSession?: SessionResolver;
  draftRepository?: ReturnType<typeof createDraftRepository>;
  allowedOrigins?: string[];
};

export function createApiServer(
  authHandler: RequestHandler,
  {
    resolveSession = noSession,
    draftRepository,
    allowedOrigins = [],
  }: ApiServerOptions = {},
) {
  const app = express();

  app.use(requestId());

  // Registered before the Better Auth catch-all so the contract's minimal SessionView wins.
  app.get("/auth/session", requireUser(resolveSession), (_req, res) => {
    res.json({ user: currentUser(res) });
  });

  app.all("/auth/*path", authHandler);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  if (draftRepository) {
    app.use(
      createDraftRoutes(
        draftRepository,
        resolveSession,
        allowedOrigins,
      ),
    );
  }

  app.use(express.json());

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    if (err.type === "entity.parse.failed") {
      return sendError(
        res, 400, "invalid-json", "Invalid JSON body.",
      );
    }

    if (err.type === "entity.too.large") {
      return sendError(
        res, 413, "payload-too-large", "Request body is too large.",
      );
    }

    sendError(
      res, 500, "internal",
      "Something went wrong. Please try again.",
    );
  };

  app.use(onError);

  return createServer(app);
}