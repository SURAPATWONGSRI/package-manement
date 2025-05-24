"use server";

import { auth, ErrorCode } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";

export async function signUpEmailAction(
  formData: FormData
): Promise<{ error: string | null; warning?: string }> {
  const name = String(formData.get("name"));
  if (!name) return { error: "กรุณากรอกชื่อ" };

  const email = String(formData.get("email"));
  if (!email) return { error: "กรุณากรอกอีเมล" };

  const password = String(formData.get("password"));
  if (!password) return { error: "กรุณากรอกรหัสผ่าน" };

  const confirmPassword = String(formData.get("confirmPassword"));
  if (!confirmPassword) return { error: "รหัสผ่านไม่ตรงกัน" };

  // Get lineId if provided, ensure it's properly trimmed
  const rawLineId = formData.get("lineId");
  let lineId = rawLineId ? String(rawLineId).trim() : null;

  if (lineId === "") {
    // If lineId is just whitespace, set it to null
    lineId = null;
  }

  console.log("Processing lineId:", lineId);

  if (password !== confirmPassword) {
    return { error: "รหัสผ่านไม่ตรงกัน" };
  }

  try {
    console.log("Registering user with name:", name);

    // Get headers for consistent context
    const headerData = await headers();

    // 1. Register the user with auth system
    const response = await auth.api.signUpEmail({
      headers: headerData,
      body: {
        name,
        email,
        password,
      },
    });

    console.log("Registration response:", response);

    // ตรวจสอบและอัปเดตชื่อผู้ใช้ถ้าจำเป็น
    try {
      // Wait a moment for the database to update
      await new Promise((resolve) => setTimeout(resolve, 100));

      const user = await prisma.user.findUnique({
        where: { email },
      });

      console.log("User after registration:", user);

      if (!user) {
        console.error("User not found after registration");
      } else if (!user.name || user.name !== name) {
        console.log("Name not set correctly, updating name to:", name);
        await prisma.user.update({
          where: { email },
          data: { name },
        });

        // Verify the update worked
        const updatedUser = await prisma.user.findUnique({
          where: { email },
        });
        console.log("User after name update:", updatedUser);
      } else {
        console.log("Name set correctly:", user.name);
      }
    } catch (err) {
      console.error("Failed to verify/update name:", err);
    }

    // 2. Update lineId if provided
    if (lineId) {
      try {
        console.log("Updating lineId for user:", email, "to:", lineId);

        // Wait a moment to ensure user creation is complete
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Check if lineId is already in use
        const existingUserWithLineId = await prisma.user.findUnique({
          where: { lineId },
          select: { email: true },
        });

        if (existingUserWithLineId) {
          console.error(
            `LineId ${lineId} is already in use by user ${existingUserWithLineId.email}`
          );
          return {
            error: null,
            warning:
              "LINE ID ที่คุณใส่ถูกใช้ไปแล้ว บัญชีได้ถูกสร้างแต่ไม่ได้ใส่ LINE ID",
          };
        } else {
          // Update the lineId
          const updatedUser = await prisma.user.update({
            where: { email },
            data: { lineId },
          });

          console.log("User after lineId update:", updatedUser);
        }
      } catch (err) {
        console.error("Failed to update lineId:", err, "for email:", email);

        // Try one more time after a longer delay
        try {
          console.log("Retrying lineId update...");
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const updatedUser = await prisma.user.update({
            where: { email },
            data: { lineId },
          });

          console.log("User after retry lineId update:", updatedUser);
        } catch (retryErr) {
          console.error("Final lineId update attempt failed:", retryErr);
          return {
            error: null,
            warning:
              "บัญชีได้ถูกสร้างแล้ว แต่ไม่สามารถบันทึก LINE ID ได้ คุณสามารถเพิ่ม LINE ID ในภายหลังได้",
          };
        }
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
