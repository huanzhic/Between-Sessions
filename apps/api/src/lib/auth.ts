import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";

export const auth = betterAuth({
  basePath: "/auth",
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: process.env.WEB_ORIGIN ? [process.env.WEB_ORIGIN] : [],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "client",
        input: false,
      },
    },
  },
});