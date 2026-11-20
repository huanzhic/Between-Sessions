import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import express, { type ErrorRequestHandler } from "express";
import { currentUser, requestId, requireRole, requireUser, sameOriginWrites } from "./middleware.js";
import type { ApiError } from "@between-sessions/contracts";
import type { SessionUser } from "./session.js";

const users: Record<string, SessionUser> = {
  maya: { id: "client-maya", role: "client", displayName: "Maya Chen" },
  lee: { id: "therapist-lee", role: "therapist", displayName: "Dr. Lee" },
};

// Throwaway routes that use the guards the way workflow routes will.
const app = express();
app.use(requestId());
app.use(sameOriginWrites(["http://localhost:5173"]));
const signedIn = requireUser(async (req) => users[String(req.headers["x-test-user"])] ?? null);
app.get("/therapist-only", signedIn, requireRole("therapist"), (_req, res) => {
  res.json({ id: currentUser(res).id });
});
app.post("/write", (_req, res) => res.json({ ok: true }));
app.get("/unguarded", (_req, res) => res.json(currentUser(res)));
const onError: ErrorRequestHandler = (_err, _req, res, _next) => res.status(500).json({ guardMissing: true });
app.use(onError);

const server = createServer(app);
let baseUrl: string;
before(async () => {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});
after(() => server.close());

const get = (path: string, headers: Record<string, string> = {}) => fetch(`${baseUrl}${path}`, { headers });
const post = (headers: Record<string, string> = {}) => fetch(`${baseUrl}/write`, { method: "POST", headers });

test("requireRole lets the right role through and blocks the other", async () => {
  const lee = await get("/therapist-only", { "x-test-user": "lee" });
  assert.equal(lee.status, 200);
  assert.deepEqual(await lee.json(), { id: "therapist-lee" });

  const maya = await get("/therapist-only", { "x-test-user": "maya" });
  assert.equal(maya.status, 403);
  assert.equal(((await maya.json()) as ApiError).error.code, "forbidden");

  assert.equal((await get("/therapist-only")).status, 401);
});

test("currentUser fails loudly on a route that forgot requireUser", async () => {
  const res = await get("/unguarded", { "x-test-user": "maya" });
  assert.equal(res.status, 500);
  assert.deepEqual(await res.json(), { guardMissing: true });
});

test("writes from another origin are rejected", async () => {
  const res = await post({ origin: "https://evil.example" });
  assert.equal(res.status, 403);
  assert.equal(((await res.json()) as ApiError).error.code, "bad-origin");
});

test("writes from the web app, requests without Origin, and reads pass", async () => {
  assert.equal((await post({ origin: "http://localhost:5173" })).status, 200);
  assert.equal((await post()).status, 200);
  const read = await get("/therapist-only", { origin: "https://evil.example", "x-test-user": "lee" });
  assert.equal(read.status, 200);
});
