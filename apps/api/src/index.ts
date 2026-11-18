import "dotenv/config";
import { createApiServer } from "./server.js";

for (const name of ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "WEB_ORIGIN"]) {
  if (!process.env[name]) {
    throw new Error(`${name} is not configured`);
  }
}

const { auth } = await import("./lib/auth.js");
const { toNodeHandler } = await import("better-auth/node");

const port = Number(process.env.PORT ?? 3000);

const server = createApiServer(toNodeHandler(auth));

server.listen(port, () => {
  console.log(`API listening on port ${port}`);
});