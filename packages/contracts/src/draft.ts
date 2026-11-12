import { z } from "zod";
import { Id, Instant, Version, limits } from "./common.js";

// Client-only. No schema in this package may embed a draft in a therapist response.
const Answer = z.strictObject({
  questionId: Id,
  text: z.string().max(limits.answer), // empty means skipped
});

const Summary = z.strictObject({
  text: z.string().max(limits.letter),
  origin: z.enum(["manual", "ai-edited"]),
});

export const PrivateDraft = z.strictObject({
  activityId: Id,
  answers: z.array(Answer),
  privateWriting: z.string().max(limits.privateWriting),
  summary: Summary,
  version: Version,
  updatedAt: Instant,
});

export const SaveReflectionRequest = z
  .strictObject({
    expectedVersion: Version,
    answers: z.array(Answer).max(limits.questionsPerActivity),
    privateWriting: z.string().max(limits.privateWriting),
    summary: Summary,
  })
  .refine(
    (body) => new Set(body.answers.map((a) => a.questionId)).size === body.answers.length,
    { message: "Each question may be answered once", path: ["answers"] },
  );

export type PrivateDraft = z.infer<typeof PrivateDraft>;
export type SaveReflectionRequest = z.infer<typeof SaveReflectionRequest>;
