import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  // Required: tells Better-Auth the canonical URL of the app.
  // In Vercel this must be set to the production domain.
  baseURL: process.env.BETTER_AUTH_URL!,
  // Required: used to sign sessions / tokens.
  secret: process.env.BETTER_AUTH_SECRET!,
  // Allow requests from both local dev and the production domain
  trustedOrigins: [
    "http://localhost:3000",
    "https://www.mhrazu.com",
    "https://mhrazu.com",
  ],
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
  session: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
      },
    },
  },
});
export type Auth = typeof auth;
