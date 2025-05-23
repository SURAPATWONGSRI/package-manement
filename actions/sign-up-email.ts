"use server";

import { auth, ErrorCode } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { APIError } from "better-auth/api";

export async function signUpEmailAction(formData: FormData) {
  const name = String(formData.get("name"));
  if (!name) return { error: "กรุณากรอกชื่อ" };

  const email = String(formData.get("email"));
  if (!email) return { error: "กรุณากรอกอีเมล" };

  const password = String(formData.get("password"));
  if (!password) return { error: "กรุณากรอกรหัสผ่าน" };

  const confirmPassword = String(formData.get("confirmPassword"));
  if (!confirmPassword) return { error: "รหัสผ่านไม่ตรงกัน" };

  const lineId = formData.get("lineId") ? String(formData.get("lineId")) : null;

  if (password !== confirmPassword) {
    return { error: "รหัสผ่านไม่ตรงกัน" };
  }

  try {
    // 1. Register the user with auth system
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    // 2. Update lineId if provided
    if (lineId) {
      try {
        await prisma.user.update({
          where: { email },
          data: { lineId },
        });
      } catch (err) {
        console.error("Failed to update lineId:", err);
      }
    }

    return { error: null };
  } catch (error) {
    if (error instanceof APIError) {
      const errCode = error.body ? (error.body.code as ErrorCode) : "UNKNOW";

      switch (errCode) {
        case "USER_ALREADY_EXISTS":
          return { error: "Oops! Something went wrong. Please try again." };
        default:
          return { error: error.message };
      }
    }
    return { error: "Internal Server Error" };
  }
}
