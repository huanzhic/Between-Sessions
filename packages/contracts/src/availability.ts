import { z } from "zod";
import { Instant, Version } from "./common.js";

export const SendBlockedReason = z.enum([
  "not-open",
  "closed",
  "canceled",
  "already-sent",
  "policy-unconfirmed",
]);

// Informational only: the send route recomputes availability on the server.
export const SendAvailability = z.strictObject({
  allowed: z.boolean(),
  reason: SendBlockedReason.optional(),
  opensAt: Instant.nullable(),
  closesAt: Instant.nullable(),
  serverNow: Instant,
  policyVersion: z.string().min(1),
  appointmentVersion: Version,
});

export type SendBlockedReason = z.infer<typeof SendBlockedReason>;
export type SendAvailability = z.infer<typeof SendAvailability>;
