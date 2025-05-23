"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    console.error("Registration error:", error);
    if (error instanceof Error) {
      return { error: "Oops! Something went wrong while registering" };
    }
    return { error: "Internal Server Error" };
  }
}
