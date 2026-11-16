import assert from "node:assert/strict";
import test from "node:test";
import { checkDeepSeek, getDeepSeekConfig } from "./deepseek.js";

test("DeepSeek configuration requires a key and defaults the model", () => {
  assert.throws(() => getDeepSeekConfig({}), /Fill in DEEPSEEK_API_KEY/);
  assert.deepEqual(getDeepSeekConfig({ DEEPSEEK_API_KEY: " fictional-key " }), {
    apiKey: "fictional-key", model: "deepseek-flash",
  });
});

test("DeepSeek probe sends a fixed message to the official HTTPS endpoint", async () => {
  const config = { apiKey: "fictional-key", model: "test-model" };
  const request: typeof fetch = async (url, options) => {
    assert.equal(url, "https://api.deepseek.com/chat/completions");
    assert.equal(options?.redirect, "error");
    assert.equal(new Headers(options?.headers).get("Authorization"), "Bearer fictional-key");
    const body = JSON.parse(String(options?.body));
    assert.equal(body.model, "test-model");
    assert.equal(body.messages[0].content, "Connection test. Reply with OK.");
    return Response.json({ choices: [{ message: { content: "OK" } }] });
  };
  await checkDeepSeek(config, request);
});

test("DeepSeek failures omit provider bodies and raw network errors", async () => {
  const config = { apiKey: "fictional-key", model: "test-model" };
  await assert.rejects(checkDeepSeek(config, async () =>
    new Response("sensitive provider body", { status: 401 })), /HTTP 401/);
  await assert.rejects(checkDeepSeek(config, async () => {
    throw new Error("sensitive network error");
  }), /^Error: DeepSeek connection failed or timed out/);
  await assert.rejects(checkDeepSeek(config, async () => Response.json({})), /empty or invalid/);
});
