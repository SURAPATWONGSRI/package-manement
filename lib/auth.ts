import { prisma } from "@/lib/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: false,
  },
  advanced: {
    generateId: false,
  },
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
