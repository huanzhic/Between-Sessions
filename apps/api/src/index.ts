import { createApiServer } from "./server.js";
import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { getDeepSeekConfig } from "./llm/deepseek.js";
import { generateSummary } from "./llm/summary.js";
import { generateWeeklySummary } from "./llm/weekly-summary.js";

const production = process.env.NODE_ENV === "production";
if (!production) {
  const localFile = fileURLToPath(new URL("../../../.env.local", import.meta.url));
  if (existsSync(localFile)) loadEnvFile(localFile);
}

const port = Number(process.env.PORT ?? 3000);

const demoEnabled = !production && process.env.AI_SUMMARY_DEMO === "true";
const config = demoEnabled ? getDeepSeekConfig(process.env) : undefined;
const server = createApiServer({
  demoSummary: config ? (input) => {
    if (input && typeof input === "object" && "kind" in input && input.kind === "treatment_interval") {
      return generateWeeklySummary(input, config);
    }
    return generateSummary(input, config);
  } : undefined,
});

server.listen(port, demoEnabled ? "127.0.0.1" : undefined, () => {
  console.log(`API listening on port ${port}`);
});
