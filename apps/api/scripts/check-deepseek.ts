import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { fileURLToPath } from "node:url";
import { checkDeepSeek, getDeepSeekConfig } from "../src/llm/deepseek.js";

try {
  const localFile = fileURLToPath(new URL("../../../.env.local", import.meta.url));
  if (existsSync(localFile)) loadEnvFile(localFile);
  const config = getDeepSeekConfig(process.env);
  console.log("Checking DeepSeek with a fixed connection-test message (a small API charge may apply)...");
  await checkDeepSeek(config);
  console.log("DeepSeek connection successful.");
} catch (error) {
  console.error(error instanceof Error ? error.message : "DeepSeek check failed.");
  process.exitCode = 1;
}
