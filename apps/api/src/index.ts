import "dotenv/config";
import { createApiServer } from "./server.js";

for (const name of ["DATABASE_URL", "BETTER_AUTH_SECRET", "BETTER_AUTH_URL", "WEB_ORIGIN"]) {
  if (!process.env[name]) {
    throw new Error(`${name} is not configured`);
  }
}

const { auth } = await import("./lib/auth.js");
const { toNodeHandler } = await import("better-auth/node");
const { betterAuthResolver } = await import("./auth/session.js");

const port = Number(process.env.PORT ?? 3000);
const { prisma } = await import("./lib/prisma.js");
const { createDraftRepository } = await import(
  "./drafts/repository.js"
);

const server = createApiServer(toNodeHandler(auth), {
  resolveSession: betterAuthResolver(auth),
  draftRepository: createDraftRepository(prisma),
  allowedOrigins: [process.env.WEB_ORIGIN!],
});

server.listen(port, () => {
  console.log(`API listening on port ${port}`);
});