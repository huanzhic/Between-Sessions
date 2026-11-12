import type { SendAvailability } from "@between-sessions/contracts";

const HOUR_MS = 60 * 60 * 1000;

export type PolicyAppointment = {
  startsAt: Date;
  status: "scheduled" | "canceled";
  version: number;
};

export type PolicyInput = {
  appointment: PolicyAppointment;
  now: Date; // server clock only, never a client-supplied time
  alreadySent: boolean;
};

// The sending rule is still an open team decision, so callers depend on this
// interface and each rule carries a version that a send request must echo back.
export interface SendPolicy {
  readonly version: string;
  evaluate(input: PolicyInput): SendAvailability;
}

export type WindowPolicyOptions = {
  version: string;
  opensHoursBefore: number;
  closesHoursBefore: number;
  oneLetterPerActivity: boolean;
};

// Sending is allowed in the half-open window
// [startsAt - opensHoursBefore, startsAt - closesHoursBefore).
// Hours are elapsed time, so across a daylight-saving change the window opens at a
// different local wall-clock time than the appointment.
export function createWindowPolicy(options: WindowPolicyOptions): SendPolicy {
  if (options.opensHoursBefore <= options.closesHoursBefore)
    throw new Error("The window must open before it closes");
  return {
    version: options.version,
    evaluate({ appointment, now, alreadySent }) {
      const base = {
        serverNow: now.toISOString(),
        policyVersion: options.version,
        appointmentVersion: appointment.version,
      };
      if (appointment.status === "canceled")
        return { ...base, allowed: false, reason: "canceled", opensAt: null, closesAt: null };

      const start = appointment.startsAt.getTime();
      const opensAt = new Date(start - options.opensHoursBefore * HOUR_MS);
      const closesAt = new Date(start - options.closesHoursBefore * HOUR_MS);
      const window = { ...base, opensAt: opensAt.toISOString(), closesAt: closesAt.toISOString() };

      if (options.oneLetterPerActivity && alreadySent)
        return { ...window, allowed: false, reason: "already-sent" };
      if (now < opensAt) return { ...window, allowed: false, reason: "not-open" };
      if (now >= closesAt) return { ...window, allowed: false, reason: "closed" };
      return { ...window, allowed: true };
    },
  };
}

// Demo default from Storyboard V3: the 24 hours before the appointment starts.
// Not an agreed product rule; see docs/project/send-window-proposal.md.
export const demoWindowPolicy = createWindowPolicy({
  version: "demo-24h-before-v1",
  opensHoursBefore: 24,
  closesHoursBefore: 0,
  oneLetterPerActivity: true,
});
