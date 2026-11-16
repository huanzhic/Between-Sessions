import { SummaryError } from "./error.js";

export type DeepSeekConfig = { apiKey: string; model: string };

export function getDeepSeekConfig(env: NodeJS.ProcessEnv): DeepSeekConfig {
  const apiKey = env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Fill in DEEPSEEK_API_KEY in the repository root .env.local file.");
  }
  return { apiKey, model: env.DEEPSEEK_MODEL?.trim() || "deepseek-flash" };
}

export async function requestDeepSeek(
  config: DeepSeekConfig,
  body: Record<string, unknown>,
  request: typeof fetch = fetch,
): Promise<{ content: string; finishReason: unknown }> {
  try {
    const response = await request("https://api.deepseek.com/chat/completions", {
      method: "POST",
      redirect: "error",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        thinking: { type: "disabled" },
        stream: false,
        ...body,
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      const status = response.status === 429 ? 429 : 503;
      throw new SummaryError(status, "provider_unavailable", `DeepSeek returned HTTP ${response.status}. Check your key, account balance, model and service availability.`);
    }
    const result = await response.json() as {
      choices?: { message?: { content?: unknown }; finish_reason?: unknown }[];
    } | null;
    const content = result?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new SummaryError(502, "invalid_output", "DeepSeek returned an empty or invalid response.");
    }
    return { content, finishReason: result?.choices?.[0]?.finish_reason };
  } catch (error) {
    if (error instanceof SummaryError) {
      throw error;
    }
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new SummaryError(504, "provider_timeout", "DeepSeek request timed out. Try again.");
    }
    throw new SummaryError(503, "provider_unavailable", "DeepSeek connection failed or timed out. Check your network and retry.");
  }
}

// A fixed, fictional connection probe. Never prints credentials or provider bodies.
export async function checkDeepSeek(config: DeepSeekConfig, request: typeof fetch = fetch): Promise<void> {
  await requestDeepSeek(config, {
    messages: [{ role: "user", content: "Connection test. Reply with OK." }],
    max_tokens: 16,
  }, request);
}
