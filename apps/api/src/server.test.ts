import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import type { ApiError } from "@between-sessions/contracts";
import { createApiServer } from "./server.js";

const server = createApiServer((_req, res) => {
  res.status(503).json({ error: "Auth unavailable in tests" });
});
let baseUrl: string;

before(async () => {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => {
  server.close();
});

function postJson(body: string) {
  return fetch(`${baseUrl}/health`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

test("GET /health reports that the API is up", async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: "ok" });
});

test("unknown paths return 404 in ApiError shape", async () => {
  const res = await fetch(`${baseUrl}/nope`);
  const body = (await res.json()) as ApiError;
  assert.equal(res.status, 404);
  assert.equal(body.error.code, "not-found");
  assert.equal(body.error.requestId, res.headers.get("x-request-id"));
});

test("malformed JSON returns 400, not 500, without echoing the body", async () => {
  const res = await postJson('{"reflection": "private words"');
  const text = await res.text();
  assert.equal(res.status, 400);
  assert.equal((JSON.parse(text) as ApiError).error.code, "bad-request");
  assert.doesNotMatch(text, /private words/);
});

test("an oversized JSON body returns 413", async () => {
  const res = await postJson(JSON.stringify({ text: "a".repeat(200_000) }));
  const body = (await res.json()) as ApiError;
  assert.equal(res.status, 413);
  assert.equal(body.error.code, "too-large");
});
