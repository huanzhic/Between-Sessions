import { z } from "zod";
import { Id, Instant, TimeZone, Version, page } from "./common.js";

export const AppointmentStatus = z.enum(["scheduled", "canceled"]);

export const AppointmentView = z.strictObject({
  id: Id,
  startsAt: Instant,
  timeZone: TimeZone,
  status: AppointmentStatus,
  version: Version,
});

export const AppointmentPage = page(AppointmentView);

export const CreateAppointmentRequest = z.strictObject({
  clientId: Id,
  startsAt: Instant,
  timeZone: TimeZone,
});

// Reschedule and cancel semantics are pending team approval.
export const UpdateAppointmentRequest = z.strictObject({
  expectedVersion: Version,
  startsAt: Instant.optional(),
  timeZone: TimeZone.optional(),
  status: AppointmentStatus.optional(),
});

export type AppointmentView = z.infer<typeof AppointmentView>;
export type CreateAppointmentRequest = z.infer<typeof CreateAppointmentRequest>;
export type UpdateAppointmentRequest = z.infer<typeof UpdateAppointmentRequest>;
