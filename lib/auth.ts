import { hashPassword, verifyPassword } from "@/lib/argon2";
import { prisma } from "@/lib/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

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
    fields: {
      name: "name", // Changed from "full_name" to "name"
      email: "email", // Changed from "email_address" to "email"
      lineId: "lineId",
    },
  },
});

console.log("💥 schema select:", {
  schema: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        lineId: true,
      },
    },
  },
});
