import { z } from "zod";
import { Id, Version, limits } from "./common.js";

export const SummarySources = z.strictObject({
  sourceDraftVersion: Version,
  answers: z.array(z.strictObject({
    questionId: Id,
    question: z.string().trim().min(1).max(limits.prompt),
    text: z.string().max(limits.answer),
  })).min(1).max(limits.questionsPerActivity),
}).refine(
  ({ answers }) => new Set(answers.map((answer) => answer.questionId)).size === answers.length,
  { message: "Source question IDs must be unique" },
).refine(
  ({ answers }) => answers.reduce((total, answer) => total + answer.text.length, 0) <= 20_000,
  { message: "Selected answers exceed the summary input limit" },
);

export const SummaryContent = z.strictObject({
  sections: z.array(z.strictObject({
    kind: z.enum(["what_happened", "client_described_feelings", "topic_for_next_session"]),
    items: z.array(z.strictObject({
      text: z.string().trim().min(1).max(1_000),
      sourceQuestionIds: z.array(Id).min(1).max(limits.questionsPerActivity)
        .refine((ids) => new Set(ids).size === ids.length),
    })).max(10),
  })).max(3),
}).refine(
  ({ sections }) => new Set(sections.map((section) => section.kind)).size === sections.length,
  { message: "Summary section kinds must be unique" },
).refine(
  ({ sections }) => sections.flatMap((section) => section.items)
    .reduce((total, item) => total + item.text.length, 0) <= limits.letter,
  { message: "Summary exceeds the letter limit" },
);

export type SummarySources = z.infer<typeof SummarySources>;
export type SummarySuggestion = z.infer<typeof SummaryContent> & { sourceDraftVersion: number };
