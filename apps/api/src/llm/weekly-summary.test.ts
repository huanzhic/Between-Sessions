import assert from "node:assert/strict";
import test from "node:test";
import { generateWeeklySummary } from "./weekly-summary.js";

const config = { apiKey: "fictional-key", model: "test-model" };
const input = {
  kind: "treatment_interval",
  sourceDraftVersion: 3,
  period: { previousSession: "2026-11-09", nextSession: "2026-11-16" },
  tasks: [
    { id: "walk", title: "Take a short walk", completed: true, answers: [] },
    { id: "reflection", title: "Reflect on work", completed: false, answers: [
      { questionId: "q1", question: "What happened?", text: "My coworker helped." },
    ] },
  ],
  personalMessage: "I want to discuss feeling supported, even though I have not marked every task complete.",
};
const content = { sections: [{ kind: "personal_expression", items: [
  { text: "I want to discuss feeling supported.", sourceIds: ["personal-message"] },
] }] };

function provider(output: unknown, finishReason = "stop"): typeof fetch {
  return async () => Response.json({ choices: [{ message: { content: JSON.stringify(output) }, finish_reason: finishReason }] });
}

test("interval summary includes all tasks, saved status, reflections and personal expression", async () => {
  const request: typeof fetch = async (url, options) => {
    const body = JSON.parse(String(options?.body));
    const sources = JSON.parse(body.messages[1].content);
    assert.equal(sources.tasks.length, 2);
    assert.equal(sources.tasks[0].completion, "marked_complete");
    assert.equal(sources.tasks[1].completion, "not_marked_complete");
    assert.equal(sources.tasks[1].answers[0].text, "My coworker helped.");
    assert.equal(sources.personalMessage.text, input.personalMessage);
    assert.match(body.messages[0].content, /entire interval/);
    return provider(content)(url, options);
  };
  const result = await generateWeeklySummary(input, config, request);
  assert.deepEqual(result.taskProgress, input.tasks.map(({ id, title, completed }) => ({ id, title, completed })));
  assert.deepEqual(result.period, input.period);
  assert.equal(result.sourceDraftVersion, 3);
});

test("a personal message alone can generate an interval summary", async () => {
  const result = await generateWeeklySummary({ ...input, tasks: [] }, config, provider(content));
  assert.deepEqual(result.taskProgress, []);
  assert.equal(result.sections[0].kind, "personal_expression");
});

test("task-only interval preserves exact incomplete and complete records", async () => {
  const result = await generateWeeklySummary({ ...input, personalMessage: "" }, config,
    provider({ sections: [{ kind: "interval_overview", items: [{ text: "A walk was marked complete.", sourceIds: ["task:walk"] }] }] }));
  assert.equal(result.taskProgress[1].completed, false);
});

test("invalid dates, duplicate tasks and empty sources do not call the provider", async () => {
  const noRequest: typeof fetch = async () => { assert.fail("Unexpected provider call"); };
  for (const bad of [
    { ...input, period: { previousSession: "2026-11-16", nextSession: "2026-11-09" } },
    { ...input, period: { previousSession: "", nextSession: "2026-11-16" } },
    { ...input, tasks: [], personalMessage: " " },
    { ...input, tasks: [input.tasks[0], input.tasks[0]] },
  ]) await assert.rejects(generateWeeklySummary(bad, config, noRequest));
});

test("model cannot replace task progress or cite excluded sources", async () => {
  for (const bad of [
    { ...content, taskProgress: [] },
    { sections: [{ kind: "interval_overview", items: [{ text: "Unknown", sourceIds: ["task:foreign"] }] }] },
  ]) await assert.rejects(generateWeeklySummary(input, config, provider(bad)), /source validation/);
  await assert.rejects(generateWeeklySummary(input, config, provider(content, "length")), /incomplete/);
});
