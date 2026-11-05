import { z } from "zod";
import { AppointmentView } from "./appointment.js";
import { Id, PersonRef, Version, limits, page } from "./common.js";

export const QuestionView = z.strictObject({
  id: Id,
  prompt: z.string().min(1).max(limits.prompt),
  position: z.number().int().positive(),
});

export const ActivityView = z.strictObject({
  id: Id,
  topic: z.string().min(1).max(limits.topic),
  appointment: AppointmentView,
  questions: z.array(QuestionView),
  recipient: PersonRef,
  version: Version,
});

export const ActivityPage = page(ActivityView);

export const CreateActivityRequest = z
  .strictObject({
    clientId: Id,
    appointmentId: Id,
    topic: z.string().trim().min(1).max(limits.topic),
    questions: z
      .array(
        z.strictObject({
          prompt: z.string().trim().min(1).max(limits.prompt),
          position: z.number().int().positive(),
        }),
      )
      .min(1)
      .max(limits.questionsPerActivity),
  })
  .refine(
    (body) => new Set(body.questions.map((q) => q.position)).size === body.questions.length,
    { message: "Question positions must be unique", path: ["questions"] },
  );

export type QuestionView = z.infer<typeof QuestionView>;
export type ActivityView = z.infer<typeof ActivityView>;
export type CreateActivityRequest = z.infer<typeof CreateActivityRequest>;
