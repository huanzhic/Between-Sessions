import { WeeklySummarySources, WeeklySummarySuggestion, weeklySourceIds } from "@between-sessions/contracts";

export async function requestWeeklySummary(input: WeeklySummarySources, signal: AbortSignal): Promise<WeeklySummarySuggestion> {
  if (!WeeklySummarySources.safeParse(input).success) {
    throw new Error("Check both session dates and include tasks or a message (maximum 20,000 characters).");
  }
  const response = await fetch("/api/demo/ai-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal,
  });
  if (response.status === 404) throw new Error("Enable AI_SUMMARY_DEMO=true locally and restart the API.");
  if (!response.ok) throw new Error("Summary generation failed. Try again or continue writing.");
  const parsed = WeeklySummarySuggestion.safeParse(await response.json());
  const ids = weeklySourceIds(input);
  const expectedTasks = input.tasks.map(({ id, title, completed }) => ({ id, title, completed }));
  if (!parsed.success || parsed.data.sourceDraftVersion !== input.sourceDraftVersion ||
    JSON.stringify(parsed.data.period) !== JSON.stringify(input.period) ||
    JSON.stringify(parsed.data.taskProgress) !== JSON.stringify(expectedTasks) ||
    parsed.data.sections.some((section) => section.items.some((item) => item.sourceIds.some((id) => !ids.has(id))))) {
    throw new Error("The interval summary response failed validation. Preview your content and try again.");
  }
  return parsed.data;
}

export function weeklyLetter(result: WeeklySummarySuggestion): string {
  const completed = result.taskProgress.filter((task) => task.completed).length;
  const narrative = result.sections.flatMap((section) => section.items.map((item) => item.text)).join("\n\n");
  const progress = result.taskProgress.map((task) =>
    `${task.completed ? "[x]" : "[ ]"} ${task.title} (${task.completed ? "marked complete" : "not marked complete"})`);
  return [
    `${result.period.previousSession} – ${result.period.nextSession}`,
    narrative,
    result.taskProgress.length ? `Tasks marked complete: ${completed} of ${result.taskProgress.length}\n${progress.join("\n")}` : "",
  ].filter(Boolean).join("\n\n");
}
