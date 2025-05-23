import { auth } from "@/lib/auth"; // path to your auth file
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);

// this route.ts file lives in /api/auth/[..all]

// /api/auth/sign_in
// /api/auth/sign_up

// /api/auth/get-session
