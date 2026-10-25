import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 3000);

// Placeholder server; the web framework is not chosen yet.
const server = createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
