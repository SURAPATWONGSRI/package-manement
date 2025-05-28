import { sendEmailAction } from "@/actions/send-email.action";
import { hashPassword, verifyPassword } from "@/lib/argon2";
import { ac, roles } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin, username } from "better-auth/plugins";
import { UserRole } from "../lib/generated/prisma";
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
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmailAction({
        to: user.email,
        subject: "Reset Your Password",
        meta: {
          description: "Please click the link below to reset your password",
          link: url,
        },
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    // expiresIn: 60,
    autoSignInAfterVerification: false,
    sendVerificationEmail: async ({ user, url }) => {
      const link = new URL(url);
      link.searchParams.set("callbackURL", "/verify");

      await sendEmailAction({
        to: user.email,
        subject: "กรุณายืนยันอีเมลของคุณ",
        meta: {
          description: "กรุณาคลิกที่ลิงก์ด้านล่างเพื่อยืนยันอีเมลของคุณ",
          link: String(link),
        },
      });
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

        // Make sure name is normalized and not empty
        let name = ctx.body.name ? normalizeName(ctx.body.name) : "";
        if (!name) {
          throw new APIError("BAD_REQUEST", {
            message: "Name is required.",
          });
        }

        console.log("Normalized name in auth middleware:", name);

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
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  advanced: {
    database: {
      generateId: false,
    },
  },
  plugins: [
    nextCookies(),
    username(),

    admin({
      defaultRole: UserRole.USER,
      adminRoles: [UserRole.ADMIN],
      ac,
      roles,
    }),
    // customSession(async ({ user, session }) => {
    //   return {
    //     session: {
    //       expiresAt: session.expiresAt,
    //       token: session.token,
    //       userAgent: session.userAgent,
    //     },
    //     user: {
    //       id: user.id,
    //       name: user.name,
    //       email: user.email,
    //       image: user.image,
    //       createdAt: user.createdAt,
    //       roles: user.role,
    //       lineId: user.lineId || null,
    //     },
    //   };
    // }),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          console.log("Before creating user:", user);
          const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(";") ?? [];

          if (ADMIN_EMAILS.includes(user.email)) {
            console.log("Assigning ADMIN role to", user.email);
            return { data: { ...user, role: UserRole.ADMIN } };
          }

          // Make sure name is set
          if (!user.name) {
            console.log("User name is missing, setting default name");
            user.name = "User " + user.email.split("@")[0];
          }

          console.log("Final user data before creation:", { ...user });
          return { data: user };
        },
      },
      update: {
        before: async (data) => {
          console.log("Updating user data:", data);
          return { data };
        },
      },
    },
  },
  user: {
    modelName: "User",
    additionalFields: {
      role: {
        type: ["USER", "ADMIN"] as Array<UserRole>,
        input: false,
      },
      lineId: {
        type: "string",
        input: false,
        output: true,
      },
    },
  },
});

export type ErrorCode = keyof typeof auth.$ERROR_CODES | "UNKNOW";
