import { randomUUID } from "node:crypto";
import type { RequestHandler, Response } from "express";
import { sendError } from "../http/errors.js";
import type { SessionResolver, SessionUser } from "./session.js";

export function requestId(): RequestHandler {
  return (_req, res, next) => {
    const id = randomUUID();
    res.locals.requestId = id;
    res.setHeader("X-Request-Id", id);
    next();
  };
}

export function requireUser(resolve: SessionResolver): RequestHandler {
  return async (req, res, next) => {
    const user = await resolve(req);
    if (!user) return sendError(res, 401, "unauthenticated", "Sign in to continue.");
    res.locals.user = user;
    next();
  };
}

// Use after requireUser.
export function requireRole(role: SessionUser["role"]): RequestHandler {
  return (_req, res, next) => {
    if (currentUser(res).role !== role)
      return sendError(res, 403, "forbidden", "You do not have access to this resource.");
    next();
  };
}

// Throws instead of returning undefined, so a route that forgot requireUser fails loudly.
export function currentUser(res: Response): SessionUser {
  const user = res.locals.user as SessionUser | undefined;
  if (!user) throw new Error("currentUser() called on a route without requireUser()");
  return user;
}

// CSRF protection for cookie sessions: browser writes must come from the web app.
// Requests without an Origin header (curl, server-to-server) carry no browser cookies by default.
export function sameOriginWrites(allowedOrigins: string[]): RequestHandler {
  return (req, res, next) => {
    const origin = req.headers.origin;
    if (req.method === "GET" || req.method === "HEAD" || !origin || allowedOrigins.includes(origin))
      return next();
    sendError(res, 403, "bad-origin", "This request must come from the Between Sessions app.");
  };
}
