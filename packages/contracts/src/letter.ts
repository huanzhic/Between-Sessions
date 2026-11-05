import { z } from "zod";
import { Id, Instant, PersonRef, Version, limits, page } from "./common.js";

// Fixed snapshot of client-approved content; no private source IDs or history.
export const SentLetterView = z.strictObject({
  id: Id,
  activityId: Id,
  appointmentId: Id,
  sender: PersonRef,
  recipient: PersonRef,
  approvedBody: z.string().min(1).max(limits.letter),
  sentAt: Instant,
});

export const InboxPage = page(SentLetterView);

// Sent with an Idempotency-Key header.
export const SendLetterRequest = z.strictObject({
  recipientId: Id,
  approvedBody: z.string().trim().min(1).max(limits.letter),
  expectedDraftVersion: Version,
  expectedAppointmentVersion: Version,
  expectedPolicyVersion: z.string().min(1),
  confirmed: z.literal(true),
});

export const AiSummaryRequest = z.strictObject({
  expectedDraftVersion: Version,
  selectedQuestionIds: z.array(Id).min(1).max(limits.questionsPerActivity),
});

export type SentLetterView = z.infer<typeof SentLetterView>;
export type SendLetterRequest = z.infer<typeof SendLetterRequest>;
export type AiSummaryRequest = z.infer<typeof AiSummaryRequest>;
