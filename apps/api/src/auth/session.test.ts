import assert from "node:assert/strict";
import type { IncomingMessage } from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import type { ApiError } from "@between-sessions/contracts";
import { createApiServer } from "../server.js";
import { betterAuthResolver, type SessionSource, type SessionUser } from "./session.js";

const maya: SessionUser = { id: "client-maya", role: "client", displayName: "Maya Chen" };
const request = (cookie?: string) => ({ headers: cookie ? { cookie } : {} }) as IncomingMessage;

function fakeSource(user: { id: string; name: string; role?: unknown } | null) {
  const seen: Headers[] = [];
  const source: SessionSource = {
    api: {
      getSession: async ({ headers }) => {
        seen.push(headers);
        return user && { user };
      },
    },
  };
  return { source, seen };
}

test("resolver maps a Better Auth user to id, role and displayName only", async () => {
  const { source, seen } = fakeSource({ id: "client-maya", name: "Maya Chen", role: "client" });
  const user = await betterAuthResolver(source)(request("better-auth.session_token=abc"));
  assert.deepEqual(user, maya);
  assert.equal(seen[0].get("cookie"), "better-auth.session_token=abc");
});

test("resolver returns null without a session", async () => {
  assert.equal(await betterAuthResolver(fakeSource(null).source)(request()), null);
});

test("resolver fails closed on an unknown or missing role", async () => {
  for (const role of ["admin", "", undefined, "Therapist"]) {
    const { source } = fakeSource({ id: "u1", name: "Fictional User", role });
    assert.equal(await betterAuthResolver(source)(request()), null, String(role));
  }
});

// GET /auth/session through the real server, with the resolver swapped for a fake.
let signedIn: SessionUser | null = null;
let throwFromResolver = false;
const server = createApiServer((_req, res) => res.status(404).end(), {
  resolveSession: async () => {
    if (throwFromResolver) throw new Error("database unavailable: secret detail");
    return signedIn;
  },
});
let baseUrl: string;

before(async () => {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => server.close());

test("GET /auth/session returns 401 in ApiError shape when signed out", async () => {
  signedIn = null;
  const res = await fetch(`${baseUrl}/auth/session`);
  const body = (await res.json()) as ApiError;
  assert.equal(res.status, 401);
  assert.equal(body.error.code, "unauthenticated");
  assert.equal(body.error.requestId, res.headers.get("x-request-id"));
});

test("GET /auth/session returns exactly the minimal SessionView", async () => {
  signedIn = maya;
  const res = await fetch(`${baseUrl}/auth/session`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { user: maya });
});

test("GET /auth/session is never cached, signed in or out", async () => {
  for (const user of [maya, null]) {
    signedIn = user;
    const res = await fetch(`${baseUrl}/auth/session`);
    assert.equal(res.headers.get("cache-control"), "no-store");
    assert.equal(res.headers.get("pragma"), "no-cache");
  }
});

test("a failing session lookup returns a generic 500 without internal details", async () => {
  throwFromResolver = true;
  try {
    const res = await fetch(`${baseUrl}/auth/session`);
    const text = await res.text();
    assert.equal(res.status, 500);
    assert.equal(JSON.parse(text).error.code, "internal");
    assert.doesNotMatch(text, /secret detail/);
  } finally {
    throwFromResolver = false;
  }
});
