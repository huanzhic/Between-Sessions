import type { IncomingMessage } from "node:http";
import { fromNodeHeaders } from "better-auth/node";
import type { SessionView } from "@between-sessions/contracts";

export type SessionUser = SessionView["user"];

export type SessionResolver = (req: IncomingMessage) => Promise<SessionUser | null>;

// The part of Better Auth this module uses, so tests can pass a fake.
export type SessionSource = {
  api: {
    getSession(options: { headers: Headers }): Promise<{
      user: { id: string; name: string; role?: unknown };
    } | null>;
  };
};

export const noSession: SessionResolver = async () => null;

// Maps a Better Auth session to the minimal user the workflow routes need.
// Fails closed: an unknown or missing role is treated as not signed in.
export function betterAuthResolver(source: SessionSource): SessionResolver {
  return async (req) => {
    const result = await source.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!result) return null;
    const { id, name, role } = result.user;
    if (role !== "client" && role !== "therapist") return null;
    return { id, role, displayName: name };
  };
}
