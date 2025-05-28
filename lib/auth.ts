import { sendEmailAction } from "@/actions/send-email.action";
import { hashPassword, verifyPassword } from "@/lib/argon2";
import { ac, roles } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { Redis } from "@upstash/redis";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { admin, username } from "better-auth/plugins";
import { UserRole } from "../lib/generated/prisma";
import { getValidDomain, normalizeName } from "./utils";

// Initialize Redis client as a singleton
const getRedisClient = (() => {
  let instance: Redis | null = null;

  return () => {
    if (instance) return instance;

    try {
      const url = process.env.UPSTASH_REDIS_REST_URL;
      const token = process.env.UPSTASH_REDIS_REST_TOKEN;

      if (!url || !token) {
        throw new Error("Redis configuration missing");
      }

      instance = new Redis({
        url,
        token,
        automaticDeserialization: true, // Enable automatic JSON parsing
        retry: { retries: 3 }, // Add retry strategy
      });

      // Log connection only in development
      if (process.env.NODE_ENV === "development") {
        instance
          .ping()
          .then(() => {
            console.log("[Upstash Redis] Connection established");
          })
          .catch(console.error);
      }

      return instance;
    } catch (error) {
      console.error("[Upstash Redis] Initialization error:", error);

      // Create a memory-based fallback with better performance
      const cache = new Map<string, any>();
      const expiryTimes = new Map<string, number>();

      instance = {
        incr: async (key: string) => {
          const current = (cache.get(key) || 0) + 1;
          cache.set(key, current);
          return current;
        },
        expire: async (key: string, seconds: number) => {
          expiryTimes.set(key, Date.now() + seconds * 1000);
          return true;
        },
        get: async (key: string) => {
          const expiry = expiryTimes.get(key);
          if (expiry && expiry < Date.now()) {
            cache.delete(key);
            expiryTimes.delete(key);
            return null;
          }
          return cache.get(key) || null;
        },
        set: async (key: string, value: any, options?: { ex?: number }) => {
          cache.set(key, value);
          if (options?.ex) {
            expiryTimes.set(key, Date.now() + options.ex * 1000);
          }
          return "OK";
        },
        ping: async () => "PONG",
      } as unknown as Redis;

      console.warn("[Upstash Redis] Using memory fallback");
      return instance;
    }
  };
})();

// Get Redis instance
const redis = getRedisClient();

// Cache configuration
const RATE_LIMIT_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 60 * 5; // 5 minutes
const CACHE_TTL = 5 * 60; // 5 minutes

// Rate limiting function with improved performance
async function checkRateLimit(ip: string, action: string) {
  if (!ip || ip === "unknown") return 1; // Skip rate limiting for unknown IPs

  const key = `rl:${action}:${ip}`; // Shorter key name for better performance
  let attempts: number;

  try {
    attempts = await redis.incr(key);

    // Set expiry on first attempt
    if (attempts === 1) {
      await redis.expire(key, RATE_LIMIT_WINDOW);
    }

    if (attempts > RATE_LIMIT_ATTEMPTS) {
      throw new APIError("TOO_MANY_REQUESTS", {
        message: "Too many attempts. Please try again later.",
      });
    }
  } catch (error) {
    // Check if it's our own rate limit error that we just threw
    if (error instanceof APIError && (error as any).status === 429) {
      throw error;
    }
    // Log Redis errors but don't block auth
    console.error("[Rate Limit] Redis error:", error);
    return 1;
  }

  return attempts;
}

// Session caching function with optimized performance
async function getCachedSession(token: string) {
  if (!token) return null;
  try {
    return await redis.get(`sess:${token}`); // Shorter key names
  } catch (error) {
    console.error("[Session Cache] Redis get error:", error);
    return null;
  }
}

async function setCachedSession(token: string, data: any) {
  if (!token || !data) return;
  try {
    await redis.set(`sess:${token}`, data, { ex: CACHE_TTL });
  } catch (error) {
    console.error("[Session Cache] Redis set error:", error);
  }
}

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
      // Apply rate limiting for authentication actions
      const clientIp =
        ctx.request?.headers?.get("x-forwarded-for") || "unknown";

      if (ctx.path === "/sign-in/email") {
        await checkRateLimit(clientIp, "sign-in");
      }

      if (ctx.path === "/sign-up/email") {
        await checkRateLimit(clientIp, "sign-up");

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

      if (ctx.path === "/reset-password") {
        await checkRateLimit(clientIp, "reset-password");
      }
    }),

    // Add session hook for caching
    resolveSession: async ({
      token,
      resolve,
    }: {
      token: string;
      resolve: () => Promise<any>;
    }) => {
      // Try to get session from cache first
      const cachedSession = await getCachedSession(token);
      if (cachedSession) {
        return cachedSession;
      }

      // If not in cache, resolve from database
      const session = await resolve();

      // Cache the result
      if (session) {
        await setCachedSession(token, session);
      }

      return session;
    },
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
