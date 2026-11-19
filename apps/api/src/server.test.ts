import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import { createApiServer } from "./server.js";
import { ApiError } from "@between-sessions/contracts";

const server = createApiServer((_req, res) => {
  res.status(503).json({ error: "Auth unavailable in tests" });
});
let baseUrl: string;

before(async () => {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  });
});

test("GET /health reports that the API is up", async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: "ok" });
});

test("unknown paths return 404 in ApiError shape", async () => {
  const res = await fetch(`${baseUrl}/nope`);

  assert.equal(res.status, 404);

  const body = ApiError.parse(await res.json());

  assert.equal(body.error.code, "not-found");
  assert.equal(body.error.message, "Endpoint not found.");
});

test("authentication routes reach the auth handler", async () => {
  const res = await fetch(`${baseUrl}/auth/sign-in/email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), {
    error: "Auth unavailable in tests",
  });
});

test("unknown write paths return 404 in ApiError shape", async () => {
  const res = await fetch(`${baseUrl}/nope`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  assert.equal(res.status, 404);

  const body = ApiError.parse(await res.json());

  assert.equal(body.error.code, "not-found");
  assert.equal(body.error.message, "Endpoint not found.");
});