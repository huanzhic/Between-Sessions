import { createServer } from "node:http";
import { handleDemoSummary, type DemoSummaryGenerator } from "./routes/demo-summary.js";

// Placeholder server; the web framework is not chosen yet.
export function createApiServer(options: { demoSummary?: DemoSummaryGenerator } = {}) {
  return createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok" }));
      return;
    }
    if (req.url === "/demo/ai-summary" && options.demoSummary) {
      void handleDemoSummary(req, res, options.demoSummary);
      return;
    }
    res.writeHead(404);
    res.end();
  });
}
