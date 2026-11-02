import { createServer } from "node:http";

// Placeholder server; the web framework is not chosen yet.
export function createApiServer() {
  return createServer((req, res) => {
    if (req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "broken" }));
      return;
    }
    res.writeHead(404);
    res.end();
  });
}
