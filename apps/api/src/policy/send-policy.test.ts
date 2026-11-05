import assert from "node:assert/strict";
import { test } from "node:test";
import { createWindowPolicy, demoWindowPolicy, type PolicyAppointment } from "./send-policy.js";

// Fictional appointment: Thu Nov 5, 2026, 10:00 AM in Los Angeles.
const appointment: PolicyAppointment = {
  startsAt: new Date("2026-11-05T18:00:00Z"),
  status: "scheduled",
  version: 3,
};
const at = (iso: string) => new Date(iso);
const evaluate = (now: string, overrides: Partial<PolicyAppointment> = {}, alreadySent = false) =>
  demoWindowPolicy.evaluate({ appointment: { ...appointment, ...overrides }, now: at(now), alreadySent });

test("window opens exactly 24 hours before the appointment", () => {
  assert.equal(evaluate("2026-11-04T17:59:59.999Z").reason, "not-open");
  assert.equal(evaluate("2026-11-04T18:00:00.000Z").allowed, true);
});

test("window closes exactly when the appointment starts", () => {
  assert.equal(evaluate("2026-11-05T17:59:59.999Z").allowed, true);
  assert.equal(evaluate("2026-11-05T18:00:00.000Z").reason, "closed");
  assert.equal(evaluate("2026-11-06T09:00:00.000Z").reason, "closed");
});

test("availability reports the window and echoes versions for the send request", () => {
  assert.deepEqual(evaluate("2026-11-05T02:00:00Z"), {
    allowed: true,
    opensAt: "2026-11-04T18:00:00.000Z",
    closesAt: "2026-11-05T18:00:00.000Z",
    serverNow: "2026-11-05T02:00:00.000Z",
    policyVersion: "demo-24h-before-v1",
    appointmentVersion: 3,
  });
});

test("a canceled appointment blocks sending and has no window", () => {
  const result = evaluate("2026-11-05T02:00:00Z", { status: "canceled" });
  assert.equal(result.allowed, false);
  assert.equal(result.reason, "canceled");
  assert.equal(result.opensAt, null);
  assert.equal(result.closesAt, null);
});

test("one letter per activity is a policy option, not a fixed rule", () => {
  assert.equal(evaluate("2026-11-05T02:00:00Z", {}, true).reason, "already-sent");
  const resendable = createWindowPolicy({
    version: "resend-allowed-test",
    opensHoursBefore: 24,
    closesHoursBefore: 0,
    oneLetterPerActivity: false,
  });
  const result = resendable.evaluate({ appointment, now: at("2026-11-05T02:00:00Z"), alreadySent: true });
  assert.equal(result.allowed, true);
});

test("a rescheduled appointment moves the window", () => {
  const later = { startsAt: new Date("2026-11-12T18:00:00Z"), version: 4 };
  const result = evaluate("2026-11-05T02:00:00Z", later);
  assert.equal(result.reason, "not-open");
  assert.equal(result.opensAt, "2026-11-11T18:00:00.000Z");
  assert.equal(result.appointmentVersion, 4);
});

test("across a daylight-saving change the window is 24 elapsed hours", () => {
  // DST ended in Los Angeles on Nov 1, 2026. A 10:00 AM PST appointment that day
  // opens its window at 11:00 AM PDT the day before, not 10:00 AM.
  const result = evaluate("2026-10-31T19:00:00Z", { startsAt: new Date("2026-11-01T18:00:00Z") });
  const localHour = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    hour12: false,
  }).format(new Date(result.opensAt!));
  assert.equal(result.opensAt, "2026-10-31T18:00:00.000Z");
  assert.equal(localHour, "11");
  assert.equal(result.allowed, true);
});

test("a window that closes before it opens is rejected", () => {
  assert.throws(() =>
    createWindowPolicy({ version: "bad", opensHoursBefore: 0, closesHoursBefore: 24, oneLetterPerActivity: true }),
  );
});
