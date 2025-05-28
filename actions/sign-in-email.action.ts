"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function signInEmailAction(formData: FormData) {
  const loginMethod = String(formData.get("loginMethod") || "email");
  const email = formData.get("email")
    ? String(formData.get("email"))
    : undefined;
  const username = formData.get("username")
    ? String(formData.get("username"))
    : undefined;
  const password = String(formData.get("password"));

  if (!password) return { error: "กรุณากรอกรหัสผ่าน" };

  if (loginMethod === "email" && !email) {
    return { error: "กรุณากรอกอีเมล" };
  }

  if (loginMethod === "username" && !username) {
    return { error: "กรุณากรอก Username" };
  }

  try {
    // ตรวจสอบกรณีเข้าสู่ระบบด้วย username
    let userEmail: string | undefined = email;

    if (loginMethod === "username" && username) {
      console.log("Login with username:", username);

      // ค้นหาอีเมลจาก username
      const user = await prisma.user.findUnique({
        where: {
          username,
          isDeleted: false,
        },
        select: {
          email: true,
          id: true,
        },
      });

      if (!user || !user.email) {
        console.error("User not found with username:", username);
        return { error: "Username หรือรหัสผ่านไม่ถูกต้อง" };
      }

      console.log(
        "Found user with email:",
        user.email,
        "for username:",
        username
      );
      userEmail = user.email;
    } else if (email) {
      // กรณีเข้าสู่ระบบด้วยอีเมล
      console.log("Login with email:", email);

      // ตรวจสอบว่ามีผู้ใช้ในฐานข้อมูลหรือไม่
      const userExists = await prisma.user.findUnique({
        where: {
          email: userEmail,
          isDeleted: false,
        },
        select: { id: true },
      });

      if (!userExists) {
        console.error("User not found with email:", userEmail);
        return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
      }
    } else {
      return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
    }

    // ตรวจสอบว่า userEmail มีค่าหรือไม่ก่อนส่งไปที่ API
    if (!userEmail) {
      console.error("No email found for authentication");
      return { error: "ไม่พบอีเมลสำหรับการเข้าสู่ระบบ" };
    }

    // เมื่อเราได้อีเมลแล้ว ไม่ว่าจะจาก username หรือจากการกรอกโดยตรง
    console.log("Attempting to sign in with email:", userEmail);

    try {
      // ใช้ better-auth API โดยส่งอีเมล (จาก username หรือจากการกรอกโดยตรง)
      const response = await auth.api.signInEmail({
        headers: await headers(),
        body: {
          email: userEmail, // ตอนนี้เรารู้แล้วว่า userEmail ไม่ใช่ undefined
          password,
        },
        asResponse: true,
      });

      // ตรวจสอบสถานะของการตอบกลับ
      if (!response.ok) {
        const responseData = await response.json().catch(() => ({}));
        console.error("Auth response not OK:", response.status, responseData);

        // ปรับข้อความผิดพลาดตามวิธีการเข้าสู่ระบบ
        const errorMessage =
          loginMethod === "email"
            ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
            : "Username หรือรหัสผ่านไม่ถูกต้อง";

        return { error: errorMessage };
      }

      console.log("Login successful");
      return { error: null };
    } catch (authError) {
      console.error("Authentication error:", authError);

      // ตรวจสอบว่าเป็นข้อผิดพลาดเกี่ยวกับรหัสผ่านหรือไม่
      const errorMessage =
        loginMethod === "email"
          ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
          : "Username หรือรหัสผ่านไม่ถูกต้อง";

      return { error: errorMessage };
    }
  } catch (error) {
    // จัดการกับข้อความผิดพลาดตามรหัสข้อผิดพลาด
    console.error("Login error details:", error);

    try {
      // ตรวจสอบรูปแบบข้อผิดพลาดที่หลากหลาย
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();

        // Safely extract error code
        let errCode = "UNKNOWN";
        try {
          const errorObj = error as any;
          errCode = errorObj.body?.code || "UNKNOWN";
        } catch (e) {
          console.error("Error extracting error code:", e);
        }

        // Handle specific error codes
        switch (errCode) {
          case "EMAIL_NOT_VERIFIED":
            return { redirect: "/verify?error=email_not_verified" };

          case "INVALID_CREDENTIALS":
          case "USER_NOT_FOUND":
          case "INVALID_PASSWORD":
            return loginMethod === "email"
              ? { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }
              : { error: "Username หรือรหัสผ่านไม่ถูกต้อง" };

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
            // Fallback to checking error message strings
            if (
              errorMessage.includes("not found") ||
              errorMessage.includes("no user") ||
              errorMessage.includes("user not found")
            ) {
              return loginMethod === "email"
                ? { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }
                : { error: "Username หรือรหัสผ่านไม่ถูกต้อง" };
            }

            if (
              errorMessage.includes("password") ||
              errorMessage.includes("invalid password") ||
              errorMessage.includes("credential") ||
              errorMessage.includes("invalid") ||
              errorMessage.includes("authentication failed")
            ) {
              return loginMethod === "email"
                ? { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }
                : { error: "Username หรือรหัสผ่านไม่ถูกต้อง" };
            }

            // Generic error handling to prevent server-side rendering errors
            return {
              error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดลองอีกครั้งในภายหลัง",
            };
        }
      }
    } catch (nestedError) {
      console.error("Error in error handling:", nestedError);
    }

    // Default fallback error message
    return { error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดลองอีกครั้งในภายหลัง" };
  }
}
