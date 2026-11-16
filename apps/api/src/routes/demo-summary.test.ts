import assert from "node:assert/strict";
import { test } from "node:test";
import type { AddressInfo } from "node:net";
import { createApiServer } from "../server.js";
import { generateSummary } from "../llm/summary.js";
import { SummaryError } from "../llm/error.js";
import type { DemoSummaryGenerator } from "./demo-summary.js";

const input = { sourceDraftVersion: 2, answers: [
  { questionId: "q1", question: "What happened?", text: "My coworker helped." },
] };
const output = { sections: [{ kind: "what_happened", items: [
  { text: "My coworker helped.", sourceQuestionIds: ["q1"] },
] }] };
const generator: DemoSummaryGenerator = (value) => generateSummary(value,
  { apiKey: "fictional-key", model: "test-model" },
  async () => Response.json({ choices: [{ message: { content: JSON.stringify(output) }, finish_reason: "stop" }] }),
);

async function withServer(generate: DemoSummaryGenerator | undefined, run: (url: string) => Promise<void>) {
  const server = createApiServer({ demoSummary: generate });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await run(`http://127.0.0.1:${(server.address() as AddressInfo).port}`);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
}

function post(url: string, body: unknown) {
  return fetch(`${url}/demo/ai-summary`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
}

test("summary demo is disabled by default", async () => {
  await withServer(undefined, async (url) => assert.equal((await post(url, input)).status, 404));
});

test("summary HTTP returns a validated suggestion and preserves health", async () => {
  await withServer(generator, async (url) => {
    const response = await post(url, input);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("Cache-Control"), "no-store");
    assert.deepEqual(await response.json(), { sourceDraftVersion: 2, ...output });
    assert.deepEqual(await (await fetch(`${url}/health`)).json(), { status: "ok" });
  });
});

test("summary HTTP rejects invalid inputs and oversized bodies", async () => {
  await withServer(generator, async (url) => {
    assert.equal((await fetch(`${url}/demo/ai-summary`)).status, 405);
    assert.equal((await fetch(`${url}/demo/ai-summary`, { method: "POST", body: "text" })).status, 415);
    const malformed = await fetch(`${url}/demo/ai-summary`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: "{",
    });
    assert.equal(malformed.status, 400);
    assert.equal((await post(url, { ...input, privateWriting: "private" })).status, 400);
    assert.equal((await post(url, { ...input, answers: [] })).status, 400);
    assert.equal((await post(url, { text: "x".repeat(128_000) })).status, 413);
    const foreign = await fetch(`${url}/demo/ai-summary`, {
      method: "POST", headers: { "Content-Type": "application/json", Origin: "https://example.com" },
      body: JSON.stringify(input),
    });
    assert.equal(foreign.status, 403);
  });
});

test("summary HTTP maps provider failures and hides unexpected error content", async () => {
  for (const status of [429, 502, 503, 504, 500]) {
    await withServer(async () => {
      if (status === 500) throw new Error("sensitive-key-and-input");
      throw new SummaryError(status, "provider_failure", "Try again.");
    }, async (url) => {
      const response = await post(url, input);
      assert.equal(response.status, status);
      const body = await response.text();
      assert.equal(body.includes("sensitive-key-and-input"), false);
      assert.equal(typeof JSON.parse(body).error.requestId, "string");
    });
  }
});
