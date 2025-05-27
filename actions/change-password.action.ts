"use server";
import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";

export async function changePasswordAction(formData: FormData) {
  const currentPassword = String(formData.get("currentPassword"));
  if (!currentPassword) return { error: "กรุณากรอกรหัสผ่านปัจจุบัน" };

  const newPassword = String(formData.get("newPassword"));
  if (!newPassword) return { error: "กรุณากรอกรหัสผ่านใหม่" };

  try {
    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword,
        newPassword,
      },
    });
    return { error: null };
  } catch (err) {
    if (err instanceof APIError) {
      return { error: err.message };
    }

    return { error: "internal server error" };
  }
}
