"use server";

import { auth } from "@/lib/auth";
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
    console.error("Registration error:", error);
    if (error instanceof Error) {
      return { error: "Oops! Something went wrong while registering" };
    }
    return { error: "Internal Server Error" };
  }
}
