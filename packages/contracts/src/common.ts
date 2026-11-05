import { z } from "zod";

// Proposed limits; the contract draft leaves exact values open for team agreement.
export const limits = {
  topic: 200,
  prompt: 500,
  questionsPerActivity: 10,
  answer: 10_000,
  privateWriting: 20_000,
  letter: 5_000,
  pageSize: 50,
} as const;

export const Id = z.string().min(1).max(128);

// ISO 8601 UTC instant, e.g. "2026-11-05T18:00:00Z".
export const Instant = z.iso.datetime();

export const TimeZone = z.string().refine(
  (zone) => {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: zone });
      return zone.includes("/") || zone === "UTC";
    } catch {
      return false;
    }
  },
  { message: "Expected an IANA time zone such as America/Los_Angeles" },
);

export const Version = z.number().int().nonnegative();

export const PersonRef = z.strictObject({
  id: Id,
  displayName: z.string().min(1),
});

export const Role = z.enum(["client", "therapist"]);

export const SessionView = z.strictObject({
  user: z.strictObject({ id: Id, role: Role, displayName: z.string().min(1) }),
});

export function page<T extends z.ZodType>(item: T) {
  return z.strictObject({ items: z.array(item), nextCursor: z.string().nullable() });
}

export type PersonRef = z.infer<typeof PersonRef>;
export type Role = z.infer<typeof Role>;
export type SessionView = z.infer<typeof SessionView>;
