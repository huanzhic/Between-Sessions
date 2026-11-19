import { Router, json } from "express";
import { SaveReflectionRequest } from "@between-sessions/contracts";
import {
  requireUser,
  requireRole,
  currentUser,
  sameOriginWrites,
} from "../auth/middleware.js";
import type { SessionResolver } from "../auth/session.js";
import { sendError } from "../http/errors.js";
import type { createDraftRepository } from "./repository.js";

type DraftRepository = ReturnType<typeof createDraftRepository>;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function createDraftRoutes(
  repository: DraftRepository,
  resolveSession: SessionResolver,
  allowedOrigins: string[],
) {
  const router = Router();

  router.use("/activities/:id/reflection", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

  router.get(
    "/activities/:id/reflection",
    requireUser(resolveSession),
    requireRole("client"),
    async (req, res) => {
      const activityId = req.params.id;
      const clientId = currentUser(res).id;

      if (
        typeof activityId !== "string" ||
        !uuidPattern.test(activityId)
      ) {
        return sendError(
          res, 400, "invalid-id", "Invalid activity ID.",
        );
      }

      const draft = await repository.getDraft(
        activityId,
        clientId,
      );

      if (!draft) {
        return sendError(
          res, 404, "not-found", "Draft not found.",
        );
      }

      res.json(draft);
    },
  );

  router.put(
    "/activities/:id/reflection",
    requireUser(resolveSession),
    requireRole("client"),
    sameOriginWrites(allowedOrigins),
json({ limit: "1mb" }),
async (req, res) => {
      const activityId = req.params.id;
      const clientId = currentUser(res).id;

      if (
        req.headers.cookie &&
        !req.headers.origin
      ) {
        return sendError(
          res, 403, "bad-origin", "Origin is required.",
        );
      }

      if (

        typeof activityId !== "string" ||
        !uuidPattern.test(activityId)
      ) {
        return sendError(
          res, 400, "invalid-id", "Invalid activity ID.",
        );
      }

      const parsed = SaveReflectionRequest.safeParse(
        req.body,
      );

      if (!parsed.success) {
        return sendError(
          res, 400, "invalid-input", "Invalid draft data.",
        );
      }

      try {
        const draft = await repository.saveDraft(
          activityId,
          clientId,
          parsed.data,
        );

        res.json(draft);
      } catch (error) {
        if (error instanceof Error) {
          switch (error.message) {
            case "ACTIVITY_NOT_FOUND":
              return sendError(
                res, 404, "not-found", "Activity not found.",
              );

            case "INVALID_QUESTION":
              return sendError(
                res, 400, "invalid-question", "Invalid question.",
              );

            case "STALE_DRAFT":
              return sendError(
                res, 409, "stale-draft",
                "Your draft has changed. Refresh before saving.",
              );
          }
        }

        throw error;
      }
    },
  );

  return router;
}