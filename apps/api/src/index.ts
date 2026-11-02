import { createApiServer } from "./server.js";

const port = Number(process.env.PORT ?? 3000);

const server = createApiServer();

server.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
