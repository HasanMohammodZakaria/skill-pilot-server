import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getDB } from "./db.js";
import { env } from "./env.js";

export function createAuth() {
  return betterAuth({
    database: mongodbAdapter(getDB()),

    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,

    emailAndPassword: {
      enabled: true,
      autoSignIn: false,
    },

    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
    },

    trustedOrigins: [env.CLIENT_URL],

   advanced: {
  defaultCookieAttributes: {
    sameSite: "lax",
    secure: env.NODE_ENV === "production",
  },
},

    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "user",
          input: false,
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;