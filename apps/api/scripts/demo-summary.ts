import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { getDeepSeekConfig } from "../src/llm/deepseek.js";
import { generateWeeklySummary } from "../src/llm/weekly-summary.js";

try {
  const localFile = fileURLToPath(new URL("../../../.env.local", import.meta.url));
  if (existsSync(localFile)) loadEnvFile(localFile);
  console.log("Generating a treatment-interval summary from fictional tasks and a personal message (API charges may apply)...");
  const result = await generateWeeklySummary({
    kind: "treatment_interval",
    sourceDraftVersion: 1,
    period: { previousSession: "2026-11-09", nextSession: "2026-11-16" },
    tasks: [
      { id: "walk", title: "Take a short walk", completed: true, answers: [] },
      { id: "breathing", title: "Try a breathing exercise", completed: false, answers: [] },
      { id: "reflection", title: "Reflect on work", completed: true, answers: [
        { questionId: "q1", question: "What happened?", text: "My manager asked me to revise a report. Later my coworker helped me." },
        { questionId: "q2", question: "How did you feel?", text: "Today I feel calmer. I did not have trouble sleeping." },
      ] },
    ],
    personalMessage: "I want to discuss how I react to feedback. I felt supported by my coworker. I have not marked the breathing exercise complete, but I do not want that to overshadow the support I received.",
  }, getDeepSeekConfig(process.env));
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : "Summary demo failed.");
  process.exitCode = 1;
}
