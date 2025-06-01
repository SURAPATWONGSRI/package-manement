"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

type LoginResult = {
  error?: string;
  redirect?: string;
};

export async function signInEmailAction(
  formData: FormData
): Promise<LoginResult> {
  const loginMethod = String(formData.get("loginMethod") || "email");
  const email = formData.get("email")
    ? String(formData.get("email"))
    : undefined;
  const username = formData.get("username")
    ? String(formData.get("username"))
    : undefined;
  const password = String(formData.get("password"));

  // Validate required fields
  if (!password) return { error: "กรุณากรอกรหัสผ่าน" };
  if (loginMethod === "email" && !email) return { error: "กรุณากรอกอีเมล" };
  if (loginMethod === "username" && !username)
    return { error: "กรุณากรอก Username" };

  try {
    // Resolve email from username if needed
    let userEmail: string | undefined = email;

    if (loginMethod === "username" && username) {
      // Find email from username
      const user = await prisma.user.findUnique({
        where: { username, isDeleted: false },
        select: { email: true, id: true },
      });

      if (!user?.email) {
        return { error: "Username หรือรหัสผ่านไม่ถูกต้อง" };
      }

      userEmail = user.email;
    } else if (email) {
      // Verify email exists in database
      const userExists = await prisma.user.findUnique({
        where: { email, isDeleted: false },
        select: { id: true },
      });

      if (!userExists) {
        return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
      }
    } else {
      return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
    }

    // Ensure we have an email to authenticate with
    if (!userEmail) {
      return { error: "ไม่พบอีเมลสำหรับการเข้าสู่ระบบ" };
    }

    try {
      // Authenticate with better-auth
      const response = await auth.api.signInEmail({
        headers: await headers(),
        body: { email: userEmail, password },
        asResponse: true,
      });

      if (!response.ok) {
        const errorMessage =
          loginMethod === "email"
            ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
            : "Username หรือรหัสผ่านไม่ถูกต้อง";

        return { error: errorMessage };
      }

      return { error: undefined };
    } catch {
      const errorMessage =
        loginMethod === "email"
          ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
          : "Username หรือรหัสผ่านไม่ถูกต้อง";

      return { error: errorMessage };
    }
  } catch (error) {
    // Handle API errors by error code
    if (error instanceof Error) {
      // Extract error code
      const errorObj = error as Error & { body?: { code?: string } };
      const errCode = errorObj.body?.code || "UNKNOWN";

      // Handle specific error codes
      switch (errCode) {
        case "EMAIL_NOT_VERIFIED":
          return { redirect: "/verify?error=email_not_verified" };

        case "INVALID_CREDENTIALS":
        case "USER_NOT_FOUND":
        case "INVALID_PASSWORD":
          return {
            error:
              loginMethod === "email"
                ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
                : "Username หรือรหัสผ่านไม่ถูกต้อง",
          };

        case "RATE_LIMITED":
          return {
            error:
              "คุณได้พยายามเข้าสู่ระบบหลายครั้งเกินไป โปรดลองอีกครั้งในภายหลัง",
          };

        case "ACCOUNT_DISABLED":
          return {
            error: "บัญชีนี้ถูกระงับการใช้งาน โปรดติดต่อผู้ดูแลระบบ",
          };

        default:
          // Fallback generic error
          return {
            error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดลองอีกครั้งในภายหลัง",
          };
      }
    }

    // Default fallback error
    return {
      error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดลองอีกครั้งในภายหลัง",
    };
  }
}
