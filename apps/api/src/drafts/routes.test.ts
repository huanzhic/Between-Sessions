import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, test } from "node:test";
import { PrivateDraft, ApiError } from "@between-sessions/contracts";
import { createApiServer } from "../server.js";
import {
  DraftRepositoryError,
  type createDraftRepository,
} from "./repository.js";

const activityId = "11111111-1111-4111-8111-111111111111";
const questionId = "22222222-2222-4222-8222-222222222222";
const newActivityId = "44444444-4444-4444-8444-444444444444";
const origin = "http://localhost:5173";

const draft: PrivateDraft = {
  activityId,
  answers: [{ questionId, text: "Test answer" }],
  privateWriting: "Private writing",
  summary: {
    text: "Test letter",
    origin: "manual",
  },
  version: 1,
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const input = {
  expectedVersion: 1,
  answers: draft.answers,
  privateWriting: "Updated private writing",
  summary: {
    text: "Updated letter",
    origin: "manual" as const,
  },
};


let getDraftCalls = 0;
let saveDraftCalls = 0;


const repository: ReturnType<typeof createDraftRepository> = {
  async getDraft(id, clientId) {
    getDraftCalls++;

    if (id !== activityId || clientId !== "client-1") {
      return null;
    }

    return draft;
  },

  async saveDraft(id, clientId, body) {
    saveDraftCalls++;
    if (
      (id !== activityId && id !== newActivityId) ||
      clientId !== "client-1"
    ) {
      throw new DraftRepositoryError("ACTIVITY_NOT_FOUND");
    }

    if (body.privateWriting === "simulate-database-error") {
      throw new Error("Internal database failure");
    }
    const currentVersion = id === newActivityId ? 0 : 1;

    if (body.expectedVersion !== currentVersion) {
      throw new DraftRepositoryError("STALE_DRAFT");
    }

    if (body.answers.some(answer => answer.questionId !== questionId)) {
      throw new DraftRepositoryError("INVALID_QUESTION");
    }

    return {
      ...draft,
      activityId: id,
      answers: body.answers,
      privateWriting: body.privateWriting,
      summary: body.summary,
      version: currentVersion + 1,
    };
  },
};

const server = createApiServer(
  (_req, res) => {
    res.sendStatus(503);
  },
  {
    draftRepository: repository,
    allowedOrigins: [origin],

    resolveSession: async req => {
      switch (req.headers.authorization) {
        case "client":
          return {
            id: "client-1",
            role: "client",
            displayName: "Test Client",
          };

        case "other-client":
          return {
            id: "client-2",
            role: "client",
            displayName: "Other Client",
          };

        case "therapist":
          return {
            id: "therapist-1",
            role: "therapist",
            displayName: "Test Therapist",
          };

        default:
          return null;
      }
    },
  },
);

let baseUrl: string;

before(async () => {
  await new Promise<void>(resolve =>
    server.listen(0, "127.0.0.1", resolve),
  );

  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port
    }/activities/${activityId}/reflection`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  });
});

function save(
  body: unknown = input,
  authorization = "client",
  requestOrigin = origin,
) {
  return fetch(baseUrl, {
    method: "PUT",
    headers: {
      Authorization: authorization,
      Origin: requestOrigin,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

test("client can retrieve their draft", async () => {
  const res = await fetch(baseUrl, {
    headers: { Authorization: "client" },
  });

  assert.equal(res.status, 200);
  assert.equal(res.headers.get("cache-control"), "no-store");
  assert.deepEqual(await res.json(), draft);
});

test("client can edit their draft", async () => {
  const res = await save();

  assert.equal(res.status, 200);
  assert.equal(res.headers.get("cache-control"), "no-store");

  const body = PrivateDraft.parse(await res.json());

  assert.equal(body.version, 2);
  assert.equal(body.summary.text, "Updated letter");
  assert.equal(body.privateWriting, "Updated private writing");

  assert.equal(body.activityId, activityId);
  assert.deepEqual(body.answers, input.answers);
  assert.equal(body.summary.origin, input.summary.origin);
});

test("client can create their first draft", async () => {
  const res = await fetch(
    baseUrl.replace(activityId, newActivityId),
    {
      method: "PUT",
      headers: {
        Authorization: "client",
        Origin: origin,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...input,
        expectedVersion: 0,
        answers: [],
      }),
    },
  );

  assert.equal(res.status, 200);
  assert.equal(res.headers.get("cache-control"), "no-store");

  const body = PrivateDraft.parse(await res.json());

  assert.equal(body.activityId, newActivityId);
  assert.equal(body.version, 1);
  assert.deepEqual(body.answers, []);
  assert.equal(body.privateWriting, input.privateWriting);
  assert.deepEqual(body.summary, input.summary);
});

test("unauthenticated reads return 401", async () => {
  const previousCalls = getDraftCalls;
  const res = await fetch(baseUrl);

  assert.equal(res.status, 401);
  assert.equal(getDraftCalls, previousCalls);
});

test("unauthenticated writes return 401", async () => {
  const previousCalls = saveDraftCalls;
  const res = await save(input, "");

  assert.equal(res.status, 401);
  assert.equal(saveDraftCalls, previousCalls);
});

test("therapists cannot read private drafts", async () => {
  const previousCalls = getDraftCalls;

  const res = await fetch(baseUrl, {
    headers: { Authorization: "therapist" },
  });

  assert.equal(res.status, 403);
  assert.equal(getDraftCalls, previousCalls);
});

test("therapists cannot edit private drafts", async () => {
  const previousCalls = saveDraftCalls;
  const res = await save(input, "therapist");

  assert.equal(res.status, 403);
  assert.equal(saveDraftCalls, previousCalls);
});

test("another client cannot read the draft", async () => {
  const res = await fetch(baseUrl, {
    headers: { Authorization: "other-client" },
  });

  assert.equal(res.status, 404);
});

test("another client cannot edit the draft", async () => {
  const res = await save(input, "other-client");

  assert.equal(res.status, 404);

  const body = ApiError.parse(await res.json());
  assert.equal(body.error.code, "not-found");
});

test("unauthorized origins are rejected", async () => {
  const res = await save(
    input,
    "client",
    "https://malicious.example",
  );

  assert.equal(res.status, 403);
});

test("cookie writes without Origin are rejected", async () => {
  const res = await fetch(baseUrl, {
    method: "PUT",
    headers: {
      Authorization: "client",
      Cookie: "session=test",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  assert.equal(res.status, 403);
  const body = ApiError.parse(await res.json());
  assert.equal(body.error.code, "bad-origin");
});

test("cookie writes with trusted Origin are accepted", async () => {
  const res = await fetch(baseUrl, {
    method: "PUT",
    headers: {
      Authorization: "client",
      Cookie: "session=test",
      Origin: origin,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  assert.equal(res.status, 200);

  const body = PrivateDraft.parse(await res.json());

  assert.equal(body.version, 2);
  assert.equal(body.privateWriting, input.privateWriting);
  assert.deepEqual(body.summary, input.summary);
});

test("missing Origin is rejected before JSON parsing", async () => {
  const res = await fetch(baseUrl, {
    method: "PUT",
    headers: {
      Authorization: "client",
      Cookie: "session=test",
      "Content-Type": "application/json",
    },
    body: '{"broken":',
  });

  assert.equal(res.status, 403);

  const body = ApiError.parse(await res.json());

  assert.equal(body.error.code, "bad-origin");
});

test("outdated draft versions return 409", async () => {
  const res = await save({
    ...input,
    expectedVersion: 0,
  });

  assert.equal(res.status, 409);

  const body = ApiError.parse(await res.json());

  assert.equal(body.error.code, "stale-draft");
});

test("unknown activity questions return 400", async () => {
  const res = await save({
    ...input,
    answers: [{
      questionId: "33333333-3333-4333-8333-333333333333",
      text: "Invalid answer",
    }],
  });

  assert.equal(res.status, 400);

  const body = ApiError.parse(await res.json());

  assert.equal(body.error.code, "invalid-question");
});

test("negative draft versions return 400", async () => {
  const res = await save({
    ...input,
    expectedVersion: -1,
  });

  assert.equal(res.status, 400);

  const body = ApiError.parse(await res.json());
  assert.equal(body.error.code, "invalid-input");
});

test("missing required draft fields return 400", async () => {
  const res = await save({
    expectedVersion: 1,
  });

  assert.equal(res.status, 400);

  const body = ApiError.parse(await res.json());
  assert.equal(body.error.code, "invalid-input");
});

test("invalid activity IDs return 400", async () => {
  const res = await fetch(
    baseUrl.replace(activityId, "invalid-id"),
    {
      headers: { Authorization: "client" },
    },
  );

  assert.equal(res.status, 400);
});

test("invalid activity IDs in writes return 400", async () => {
  const res = await fetch(
    baseUrl.replace(activityId, "invalid-id"),
    {
      method: "PUT",
      headers: {
        Authorization: "client",
        Origin: origin,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  assert.equal(res.status, 400);

  const body = ApiError.parse(await res.json());
  assert.equal(body.error.code, "invalid-id");
});

test("malformed JSON returns 400", async () => {
  const res = await fetch(baseUrl, {
    method: "PUT",
    headers: {
      Authorization: "client",
      Origin: origin,
      "Content-Type": "application/json",
    },
    body: '{"broken":',
  });

  assert.equal(res.status, 400);

  const body = ApiError.parse(await res.json());

  assert.equal(body.error.code, "invalid-json");
});

test("unexpected repository errors return 500", async () => {
  const res = await save({
    ...input,
    privateWriting: "simulate-database-error",
  });

  assert.equal(res.status, 500);

  const responseText = await res.text();

  ApiError.parse(JSON.parse(responseText));
  assert.ok(!responseText.includes("Internal database failure"));
});

test("oversized requests return 413", async () => {
  const res = await save({
    ...input,
    privateWriting: "x".repeat(1100000),
  });

  assert.equal(res.status, 413);

  const body = ApiError.parse(await res.json());

  assert.equal(body.error.code, "payload-too-large");
});

test("large valid drafts are accepted", async () => {
  const privateWriting = "\u0001".repeat(20000);

  const res = await save({
    ...input,
    privateWriting,
  });

  assert.equal(res.status, 200);

  const body = PrivateDraft.parse(await res.json());

  assert.equal(body.privateWriting, privateWriting);
  assert.equal(body.version, 2);
});