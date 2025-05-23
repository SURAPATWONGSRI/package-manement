"use server";

import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";

export async function signInEmailAction(formData: FormData) {
  const email = String(formData.get("email"));
  if (!email) return { error: "กรุณากรอกอีเมล" };

  const password = String(formData.get("password"));
  if (!password) return { error: "กรุณากรอกรหัสผ่าน" };

  try {
    await auth.api.signInEmail({
      headers: await headers(),
      body: {
        email,
        password,
      },
      asResponse: true,
    });

    //set cookie

    return { error: null };
  } catch (error) {
    if (error instanceof APIError) {
      return { error: error.message };
    }
    return { error: "Internal Server Error" };
  }
}
