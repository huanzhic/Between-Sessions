import type { Response } from "express";
import type { ApiError } from "@between-sessions/contracts";

// Messages stay generic: never echo reflection, letter or request content.
export function sendError(res: Response, status: number, code: string, message: string) {
  const body: ApiError = {
    error: { code, message, requestId: String(res.locals.requestId ?? "unknown") },
  };
  res.status(status).json(body);
}
