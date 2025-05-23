import { hashPassword, verifyPassword } from "@/lib/argon2";
import { prisma } from "@/lib/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { getValidDomain, normalizeName } from "./utils";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: false,
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const email = String(ctx.body.email);
        const domain = email.split("@")[1];

        const VALID_DOMAINS = getValidDomain();
        if (!VALID_DOMAINS.includes(domain)) {
          throw new APIError("BAD_REQUEST", {
            message: "Invalid domain. Please use a valid email domain.",
          });
        }

        const name = normalizeName(ctx.body.name);

        return {
          context: {
            ...ctx,
            body: {
              ...ctx.body,
              name,
            },
          },
        };
      }
    }),
  },
  session: {
    expiresIn: 30 * 24 * 60 * 60, // 30 days
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
  plugins: [nextCookies()],
  user: {
    modelName: "User",
    additionalFields: {
      role: {
        type: ["USER", "ADMIN"],
        input: false,
      },
      lineId: {
        type: "string",
        input: false,
      },
    },
  },
});

export type ErrorCode = keyof typeof auth.$ERROR_CODES | "UNKNOW";
