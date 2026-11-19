import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createDraftRepository } from "./repository.js";

test(
  "PostgreSQL draft persistence and editing",
  {
    skip: process.env.RUN_DB_TESTS !== "1",
  },
  async () => {
    const { prisma } = await import("../lib/prisma.js");
    const repository = createDraftRepository(prisma);

    const clientId = randomUUID();
    const therapistId = randomUUID();
    const otherClientId = randomUUID();

    const relationshipId = randomUUID();
    const appointmentId = randomUUID();
    const activityId = randomUUID();
    const questionId = randomUUID();

    try {
      await prisma.user.createMany({
        data: [
          {
            id: clientId,
            name: "Test Client",
            email: `${clientId}@example.test`,
            role: "client",
          },
          {
            id: therapistId,
            name: "Test Therapist",
            email: `${therapistId}@example.test`,
            role: "therapist",
          },
          {
            id: otherClientId,
            name: "Other Test Client",
            email: `${otherClientId}@example.test`,
            role: "client",
          },
        ],
      });

      await prisma.therapistClient.create({
        data: {
          id: relationshipId,
          clientId,
          therapistId,
          status: "active",
        },
      });

      await prisma.appointment.create({
        data: {
          id: appointmentId,
          therapistClientId: relationshipId,
          startsAt: new Date(Date.now() + 86400000),
          timeZone: "America/Los_Angeles",
        },
      });

      await prisma.activity.create({
        data: {
          id: activityId,
          therapistClientId: relationshipId,
          appointmentId,
          topic: "Integration test activity",
        },
      });

      await prisma.activityQuestion.create({
        data: {
          id: questionId,
          activityId,
          prompt: "How was your day?",
          position: 1,
        },
      });

      const input = {
        expectedVersion: 0,
        answers: [
          {
            questionId,
            text: "My original answer.",
          },
        ],
        privateWriting: "Original private writing.",
        summary: {
          text: "My original letter.",
          origin: "manual" as const,
        },
      };

      // Test 1: No saved draft exists.
      assert.equal(
        await repository.getDraft(activityId, clientId),
        null,
      );

// Test 2: Concurrent first-time saves.
const firstSaves = await Promise.allSettled([
  repository.saveDraft(activityId, clientId, input),
  repository.saveDraft(activityId, clientId, input),
]);

const firstSuccess = firstSaves.find(
  result => result.status === "fulfilled",
);

const firstFailure = firstSaves.find(
  result => result.status === "rejected",
);

assert.ok(firstSuccess);
assert.ok(firstFailure);

assert.match(
  String(firstFailure.reason),
  /STALE_DRAFT/,
);

const created = firstSuccess.value;

assert.equal(created.version, 1);
assert.equal(created.summary.text, "My original letter.");

      assert.equal(created.version, 1);
      assert.equal(created.summary.text, "My original letter.");

      // Test 3: Retrieve the saved draft.
      const retrieved = await repository.getDraft(
        activityId,
        clientId,
      );

      assert.deepEqual(retrieved, created);

      // Test 4: Edit an existing draft.
      const edited = await repository.saveDraft(
        activityId,
        clientId,
        {
          ...input,
          expectedVersion: 1,
          answers: [
            {
              questionId,
              text: "My edited answer.",
            },
          ],
          privateWriting: "Updated private writing.",
          summary: {
            text: "My edited letter.",
            origin: "manual",
          },
        },
      );

      assert.equal(edited.version, 2);
      assert.equal(edited.summary.text, "My edited letter.");
      assert.equal(edited.answers[0]?.text, "My edited answer.");
      assert.equal(
        edited.privateWriting,
        "Updated private writing.",
      );

      // Test 5: Retrieve the edited draft.
      assert.deepEqual(
        await repository.getDraft(activityId, clientId),
        edited,
      );

      // Test 6: Reject an outdated save.
      await assert.rejects(
        repository.saveDraft(activityId, clientId, input),
        /STALE_DRAFT/,
      );

      // Test 7: Block another client's access.
      assert.equal(
        await repository.getDraft(activityId, otherClientId),
        null,
      );

      // Test 8: Block another client's edits.
      await assert.rejects(
        repository.saveDraft(activityId, otherClientId, input),
        /ACTIVITY_NOT_FOUND/,
      );

      // Test 9: Reject invalid questions.
      await assert.rejects(
        repository.saveDraft(activityId, clientId, {
          ...input,
          expectedVersion: 2,
          answers: [
            {
              questionId: randomUUID(),
              text: "Invalid answer.",
            },
          ],
        }),
        /INVALID_QUESTION/,
      );

      // Test 10: Verify rejected saves changed nothing.
      assert.deepEqual(
        await repository.getDraft(activityId, clientId),
        edited,
      );

      // Test 12: Reject simultaneous conflicting edits.
    const concurrentResults = await Promise.allSettled([
        repository.saveDraft(activityId, clientId, {
    ...input,
    expectedVersion: 2,
    privateWriting: "Concurrent edit A.",
  }),
  repository.saveDraft(activityId, clientId, {
    ...input,
    expectedVersion: 2,
    privateWriting: "Concurrent edit B.",
  }),
]);

const successful = concurrentResults.filter(
  result => result.status === "fulfilled",
);

const rejected = concurrentResults.filter(
  result => result.status === "rejected",
);

assert.equal(successful.length, 1);
assert.equal(rejected.length, 1);

assert.match(
  String(rejected[0]?.reason),
  /STALE_DRAFT/,
);

const latest = await repository.getDraft(
  activityId,
  clientId,
);

assert.equal(latest?.version, 3);

      // Test 11: Verify no duplicate drafts exist.
      assert.equal(
        await prisma.reflectionDraft.count({
          where: { activityId, clientId },
        }),
        1,
      );
      // Test 13: Block access after relationship deactivation.
await prisma.therapistClient.update({
  where: { id: relationshipId },
  data: { status: "inactive" },
});

assert.equal(
  await repository.getDraft(activityId, clientId),
  null,
);

await assert.rejects(
  repository.saveDraft(activityId, clientId, {
    ...input,
    expectedVersion: 3,
  }),
  /ACTIVITY_NOT_FOUND/,
);
    } finally {
      try {
        await prisma.draftAnswer.deleteMany({
          where: { activityId },
        });

        await prisma.reflectionDraft.deleteMany({
          where: { activityId },
        });

        await prisma.activityQuestion.deleteMany({
          where: { activityId },
        });

        await prisma.activity.deleteMany({
          where: { id: activityId },
        });

        await prisma.appointment.deleteMany({
          where: { id: appointmentId },
        });

        await prisma.therapistClient.deleteMany({
          where: { id: relationshipId },
        });

        await prisma.user.deleteMany({
          where: {
            id: {
              in: [clientId, therapistId, otherClientId],
            },
          },
        });
      } finally {
        await prisma.$disconnect();
      }
    }

  },
);
