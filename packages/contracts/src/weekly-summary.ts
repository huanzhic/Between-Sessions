import { z } from "zod";
import { Id, Version } from "./common.js";

const Period = z.strictObject({
  previousSession: z.iso.date(),
  nextSession: z.iso.date(),
}).refine((period) => period.previousSession < period.nextSession, {
  message: "Next session must be after the previous session",
});

export const WeeklySummarySources = z.strictObject({
  kind: z.literal("treatment_interval"),
  sourceDraftVersion: Version,
  period: Period,
  tasks: z.array(z.strictObject({
    id: Id,
    title: z.string().trim().min(1).max(500),
    completed: z.boolean(),
    answers: z.array(z.strictObject({
      questionId: Id,
      question: z.string().trim().min(1).max(500),
      text: z.string().max(10_000),
    })).max(10).refine((answers) => new Set(answers.map((answer) => answer.questionId)).size === answers.length),
  })).max(100).refine((tasks) => new Set(tasks.map((task) => task.id)).size === tasks.length),
  personalMessage: z.string().max(10_000),
}).refine((input) => input.tasks.length > 0 || input.personalMessage.trim().length > 0, {
  message: "Include tasks or your own message",
}).refine((input) => input.personalMessage.length + input.tasks.reduce((total, task) =>
  total + task.title.length + task.answers.reduce((sum, answer) => sum + answer.question.length + answer.text.length, 0), 0) <= 20_000, {
  message: "The selected interval content exceeds 20,000 characters",
});

export const WeeklySummaryContent = z.strictObject({
  sections: z.array(z.strictObject({
    kind: z.enum(["interval_overview", "personal_expression", "topic_for_next_session"]),
    items: z.array(z.strictObject({
      text: z.string().trim().min(1).max(1_000),
      sourceIds: z.array(z.string().min(1).max(512)).min(1).max(100)
        .refine((ids) => new Set(ids).size === ids.length),
    })).max(10),
  })).max(3),
}).refine(({ sections }) => new Set(sections.map((section) => section.kind)).size === sections.length)
  .refine(({ sections }) => sections.flatMap((section) => section.items)
    .reduce((total, item) => total + item.text.length, 0) <= 5_000);

export const WeeklySummarySuggestion = z.strictObject({
  sourceDraftVersion: Version,
  period: Period,
  taskProgress: z.array(z.strictObject({ id: Id, title: z.string().min(1).max(500), completed: z.boolean() })).max(100),
  sections: WeeklySummaryContent.shape.sections,
}).refine((result) => WeeklySummaryContent.safeParse({ sections: result.sections }).success);

export function weeklySourceIds(input: WeeklySummarySources): Set<string> {
  const ids = new Set<string>();
  for (const task of input.tasks) {
    ids.add(`task:${task.id}`);
    for (const answer of task.answers) {
      if (answer.text.trim()) ids.add(`answer:${task.id}:${answer.questionId}`);
    }
  }
  if (input.personalMessage.trim()) ids.add("personal-message");
  return ids;
}

export type WeeklySummarySources = z.infer<typeof WeeklySummarySources>;
export type WeeklySummarySuggestion = z.infer<typeof WeeklySummarySuggestion>;
