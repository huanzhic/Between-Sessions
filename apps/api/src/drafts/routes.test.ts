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

const repository: ReturnType<typeof createDraftRepository> = {
  async getDraft(id, clientId) {
    if (id !== activityId || clientId !== "client-1") {
      return null;
    }

    return draft;
  },

  async saveDraft(id, clientId, body) {
    if (id !== activityId || clientId !== "client-1") {
      throw new DraftRepositoryError("ACTIVITY_NOT_FOUND");
    }

    if (body.expectedVersion !== 1) {
      throw new DraftRepositoryError("STALE_DRAFT");
    }

    if (body.answers.some(answer => answer.questionId !== questionId)) {
      throw new DraftRepositoryError("INVALID_QUESTION");
    }

    return {
      ...draft,
      answers: body.answers,
      privateWriting: body.privateWriting,
      summary: body.summary,
      version: 2,
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

test("unauthenticated reads return 401", async () => {
  const res = await fetch(baseUrl);

  assert.equal(res.status, 401);
});

test("unauthenticated writes return 401", async () => {
  const res = await save(input, "");

  assert.equal(res.status, 401);
});

test("therapists cannot read private drafts", async () => {
  const res = await fetch(baseUrl, {
    headers: { Authorization: "therapist" },
  });

  assert.equal(res.status, 403);
});

test("therapists cannot edit private drafts", async () => {
  const res = await save(input, "therapist");

  assert.equal(res.status, 403);
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

test("invalid request bodies return 400", async () => {
  const res = await save({
    expectedVersion: -1,
  });

  assert.equal(res.status, 400);
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
  const res = await save({
    ...input,
    privateWriting: "\u0001".repeat(20000),
  });

  assert.equal(res.status, 200);
});