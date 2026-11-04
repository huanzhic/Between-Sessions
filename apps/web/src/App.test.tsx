import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToString } from "react-dom/server";
import App from "./App";
import { inbox, newDraft } from "./fixtures";
import { Therapist } from "./Therapist";
import { checkHealth } from "./Health";

test("App renders the product heading", () => {
  const html = renderToString(<App />);
  assert.match(html, /Between Sessions/);
  assert.match(html, /Welcome back, Maya/);
  assert.match(html, /No sign-in or server storage/);
  assert.match(html, /#\/sos/);
});

test("therapist fixtures and rendered inbox exclude private drafts", () => {
  const draft = newDraft();
  draft.answers[0].text = "PRIVATE_CANARY";
  const html = renderToString(<Therapist route="/therapist/letters" />);
  assert.doesNotMatch(html, /PRIVATE_CANARY/);
  for (const letter of inbox)
    assert.deepEqual(
      Object.keys(letter).sort(),
      [
        "id",
        "activityId",
        "appointmentId",
        "sender",
        "recipient",
        "approvedBody",
        "sentAt",
      ].sort(),
    );
});

test("health requires a successful response with status ok", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ status: "ok" }));
    await checkHealth();
    globalThis.fetch = async () => new Response("", { status: 503 });
    await assert.rejects(checkHealth);
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ status: "down" }));
    await assert.rejects(checkHealth);
  } finally {
    globalThis.fetch = original;
  }
});
