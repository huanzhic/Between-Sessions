import { createApiServer } from "./server.js";

const server = createApiServer((_req, res) => {
  res.status(404).end();
});

server.listen(3000, () => {
  console.log("E2E health server running on port 3000");
});