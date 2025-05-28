"use server";

import { auth, ErrorCode } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";

type SignUpResult = {
  error: string | null;
  warning?: string;
};

/**
 * Updates user details to ensure consistency
 */
async function updateUserDetails(
  email: string,
  name: string,
  username: string
): Promise<void> {
  try {
    // Wait a moment for the database to update
    await new Promise((resolve) => setTimeout(resolve, 100));

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return;
    }

    // Check if update is needed
    const needsUpdate =
      !user.name ||
      user.name !== name ||
      !user.username ||
      user.username !== username;

    if (needsUpdate) {
      await prisma.user.update({
        where: { email },
        data: {
          name,
          username,
          role: "USER", // Explicitly set the role to USER
        },
      });
    }
  } catch (err) {
    // Swallow error - this is a non-critical operation
  }
}

/**
 * Updates user's LINE ID
 */
async function updateUserLineId(
  email: string,
  lineId: string
): Promise<{ warning?: string }> {
  try {
    // Wait to ensure user creation is complete
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if lineId is already in use
    const existingUserWithLineId = await prisma.user.findUnique({
      where: { lineId },
      select: { email: true },
    });

    if (existingUserWithLineId) {
      return {
        warning:
          "LINE ID ที่คุณใส่ถูกใช้ไปแล้ว บัญชีได้ถูกสร้างแต่ไม่ได้ใส่ LINE ID",
      };
    }

    // Update the lineId
    await prisma.user.update({
      where: { email },
      data: {
        lineId,
        role: "USER",
      },
    });

    return {};
  } catch (err) {
    // Try one more time after a longer delay
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await prisma.user.update({
        where: { email },
        data: {
          lineId,
          role: "USER",
        },
      });

      return {};
    } catch (retryErr) {
      return {
        warning:
          "บัญชีได้ถูกสร้างแล้ว แต่ไม่สามารถบันทึก LINE ID ได้ คุณสามารถเพิ่ม LINE ID ในภายหลังได้",
      };
    }
  }
}

export async function signUpEmailAction(
  formData: FormData
): Promise<SignUpResult> {
  // Extract and validate form fields
  const name = String(formData.get("name"));
  if (!name) return { error: "กรุณากรอกชื่อ" };

  const username = String(formData.get("username"));
  if (!username) return { error: "กรุณากรอก Username" };

  // Validate username format (only allow letters, numbers, and underscores)
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { error: "Username ต้องประกอบด้วยตัวอักษร ตัวเลข หรือ _ เท่านั้น" };
  }

  // Check if username already exists
  const existingUsername = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (existingUsername) {
    return { error: "Username นี้ถูกใช้งานแล้ว กรุณาเลือก Username อื่น" };
  }

  const email = String(formData.get("email"));
  if (!email) return { error: "กรุณากรอกอีเมล" };

  const password = String(formData.get("password"));
  if (!password) return { error: "กรุณากรอกรหัสผ่าน" };

  const confirmPassword = String(formData.get("confirmPassword"));
  if (!confirmPassword) return { error: "รหัสผ่านไม่ตรงกัน" };

  // Get lineId if provided, ensure it's properly trimmed
  const lineId = formData.get("lineId")
    ? String(formData.get("lineId")).trim() || null
    : null;

  if (password !== confirmPassword) {
    return { error: "รหัสผ่านไม่ตรงกัน" };
  }

  try {
    // Register the user with auth system
    await auth.api.signUpEmail({
      headers: await headers(),
      body: {
        name,
        username,
        email,
        password,
      },
    });

    // Ensure user data is consistent
    await updateUserDetails(email, name, username);

    // Update lineId if provided
    if (lineId) {
      const lineIdResult = await updateUserLineId(email, lineId);
      if (lineIdResult.warning) {
        return { error: null, warning: lineIdResult.warning };
      }
    }

    return { error: null };
  } catch (error) {
    if (error instanceof APIError) {
      const errCode = error.body ? (error.body.code as ErrorCode) : "UNKNOW";

      switch (errCode) {
        case "USER_ALREADY_EXISTS":
          return { error: "อีเมลหรือ Username นี้ถูกใช้งานแล้ว" };
        default:
          return { error: error.message };
      }
    }
    return { error: "Internal Server Error" };
  }
}
