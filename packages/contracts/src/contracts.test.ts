import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ActivityView,
  CreateActivityRequest,
  CreateAppointmentRequest,
  InboxPage,
  PrivateDraft,
  SaveReflectionRequest,
  SendLetterRequest,
  SentLetterView,
} from "./index.js";

// Fictional Dr. Lee / Maya scenario, matching the planned seed.
const appointment = {
  id: "appointment-maya",
  startsAt: "2026-11-05T18:00:00Z",
  timeZone: "America/Los_Angeles",
  status: "scheduled",
  version: 1,
};
const letter = {
  id: "letter-maya",
  activityId: "reflection-maya",
  appointmentId: appointment.id,
  sender: { id: "client-maya", displayName: "Maya Chen" },
  recipient: { id: "therapist-lee", displayName: "Dr. Lee" },
  approvedBody: "Breaking it into smaller steps helped.",
  sentAt: "2026-11-05T02:00:00Z",
};

test("activity view accepts the fictional scenario", () => {
  ActivityView.parse({
    id: "reflection-maya",
    topic: "A stressful moment at work",
    appointment,
    recipient: { id: "therapist-lee", displayName: "Dr. Lee" },
    version: 1,
    questions: [{ id: "happened", prompt: "What happened?", position: 1 }],
  });
});

test("therapist-facing letter DTOs reject any private field", () => {
  SentLetterView.parse(letter);
  for (const leak of ["answers", "privateWriting", "summary", "sourceVersion"])
    assert.equal(SentLetterView.safeParse({ ...letter, [leak]: "x" }).success, false, leak);
  assert.equal(
    InboxPage.safeParse({ items: [{ ...letter, privateWriting: "x" }], nextCursor: null }).success,
    false,
  );
});

test("requests cannot carry a client-supplied actor or role", () => {
  const send = {
    recipientId: "therapist-lee",
    approvedBody: "Only share this.",
    expectedDraftVersion: 3,
    expectedAppointmentVersion: 1,
    expectedPolicyVersion: "demo-24h-before-v1",
    confirmed: true,
  };
  SendLetterRequest.parse(send);
  assert.equal(SendLetterRequest.safeParse({ ...send, senderId: "client-maya" }).success, false);
  assert.equal(SendLetterRequest.safeParse({ ...send, role: "therapist" }).success, false);
});

test("sending requires explicit confirmation and a non-empty letter", () => {
  const base = {
    recipientId: "therapist-lee",
    expectedDraftVersion: 0,
    expectedAppointmentVersion: 1,
    expectedPolicyVersion: "demo-24h-before-v1",
  };
  assert.equal(
    SendLetterRequest.safeParse({ ...base, approvedBody: "Hi", confirmed: false }).success,
    false,
  );
  assert.equal(
    SendLetterRequest.safeParse({ ...base, approvedBody: "   ", confirmed: true }).success,
    false,
  );
});

test("skipped answers save, duplicate answers do not", () => {
  const body = {
    expectedVersion: 0,
    answers: [{ questionId: "happened", text: "" }],
    privateWriting: "",
    summary: { text: "", origin: "manual" },
  };
  SaveReflectionRequest.parse(body);
  assert.equal(
    SaveReflectionRequest.safeParse({ ...body, answers: [...body.answers, ...body.answers] })
      .success,
    false,
  );
  assert.equal(
    PrivateDraft.safeParse({ ...body, activityId: "a", version: 0, updatedAt: "x" }).success,
    false,
  );
});

test("instants must be UTC and time zones must be IANA names", () => {
  const ok = { clientId: "client-maya", startsAt: appointment.startsAt, timeZone: "America/Los_Angeles" };
  CreateAppointmentRequest.parse(ok);
  for (const bad of [
    { ...ok, startsAt: "2026-11-05T10:00:00-08:00" },
    { ...ok, startsAt: "Nov 5 2026" },
    { ...ok, timeZone: "Mars/Olympus" },
    { ...ok, timeZone: "PST" },
  ])
    assert.equal(CreateAppointmentRequest.safeParse(bad).success, false, JSON.stringify(bad));
});

test("activity questions need unique positions", () => {
  const body = {
    clientId: "client-maya",
    appointmentId: appointment.id,
    topic: "A stressful moment at work",
    questions: [
      { prompt: "What happened?", position: 1 },
      { prompt: "What helped?", position: 1 },
    ],
  };
  assert.equal(CreateActivityRequest.safeParse(body).success, false);
});
