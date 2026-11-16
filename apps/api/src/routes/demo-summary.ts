import type { IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import type { SummarySuggestion, WeeklySummarySuggestion } from "@between-sessions/contracts";
import { SummaryError } from "../llm/error.js";

export type DemoSummaryGenerator = (input: unknown) => Promise<SummarySuggestion | WeeklySummarySuggestion>;

const allowedOrigins = new Set([
  "http://localhost:5173", "http://127.0.0.1:5173",
  "http://localhost:3000", "http://127.0.0.1:3000",
]);

export async function handleDemoSummary(
  req: IncomingMessage,
  res: ServerResponse,
  generate: DemoSummaryGenerator,
): Promise<void> {
  const requestId = randomUUID();
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.headers.origin && !allowedOrigins.has(req.headers.origin)) {
      throw new SummaryError(403, "origin_denied", "This demo accepts local development origins only.");
    }
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      throw new SummaryError(405, "method_not_allowed", "Use POST for summary generation.");
    }
    if (req.headers["content-type"]?.split(";")[0].trim().toLowerCase() !== "application/json") {
      throw new SummaryError(415, "unsupported_media_type", "Send an application/json request.");
    }
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of req.iterator({ destroyOnReturn: false })) {
      const bytes = Buffer.from(chunk);
      size += bytes.length;
      if (size > 128_000) {
        req.resume();
        throw new SummaryError(413, "input_too_large", "Summary request exceeds the allowed size.");
      }
      chunks.push(bytes);
    }
    let input: unknown;
    try {
      input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      throw new SummaryError(400, "invalid_json", "Send a valid JSON request.");
    }
    const result = await generate(input);
    res.writeHead(200);
    res.end(JSON.stringify(result));
  } catch (error) {
    const known = error instanceof SummaryError;
    res.writeHead(known ? error.status : 500);
    res.end(JSON.stringify({ error: {
      code: known ? error.code : "internal_error",
      message: known ? error.message : "Summary generation failed. Try again.",
      requestId,
    } }));
  }
}
