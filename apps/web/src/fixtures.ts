// Fictional DTOs matching the API draft; these are not API results.
export type AppointmentView = {
  id: string;
  startsAt: string;
  timeZone: string;
  status: "scheduled" | "canceled";
  version: number;
};
export type ActivityView = {
  id: string;
  topic: string;
  appointment: AppointmentView;
  questions: { id: string; prompt: string; position: number }[];
  recipient: { id: string; displayName: string };
  version: number;
};
export type PrivateDraft = {
  activityId: string;
  answers: { questionId: string; text: string }[];
  privateWriting: string;
  summary: { text: string; origin: "manual" | "ai-edited" };
  version: number;
  updatedAt: string;
};
export type SentLetterView = {
  id: string;
  activityId: string;
  appointmentId: string;
  sender: { id: string; displayName: string };
  recipient: { id: string; displayName: string };
  approvedBody: string;
  sentAt: string;
};
export const appointment: AppointmentView = {
  id: "appointment-maya",
  startsAt: "2026-11-05T18:00:00Z",
  timeZone: "America/Los_Angeles",
  status: "scheduled",
  version: 1,
};
export const activity: ActivityView = {
  id: "reflection-maya",
  topic: "A stressful moment at work",
  appointment,
  recipient: { id: "therapist-lee", displayName: "Dr. Lee" },
  version: 1,
  questions: [
    { id: "happened", prompt: "What happened?", position: 1 },
    { id: "felt", prompt: "What did you notice or feel?", position: 2 },
    { id: "helped", prompt: "What helped you pause?", position: 3 },
  ],
};
export function newDraft(): PrivateDraft {
  return {
    activityId: activity.id,
    answers: activity.questions.map((q) => ({ questionId: q.id, text: "" })),
    privateWriting: "",
    summary: { text: "", origin: "manual" },
    version: 0,
    updatedAt: "",
  };
}
// Therapist fixtures are allowlisted separately and never contain a private draft.
export const inbox: SentLetterView[] = [
  {
    id: "letter-maya",
    activityId: activity.id,
    appointmentId: appointment.id,
    sender: { id: "client-maya", displayName: "Maya Chen" },
    recipient: activity.recipient,
    approvedBody:
      "I felt overwhelmed when I was asked to revise a presentation. Breaking it into smaller steps helped. I would like to talk about asking for support at work.",
    sentAt: "2026-11-03T20:00:00Z",
  },
];
