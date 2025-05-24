"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function signInEmailAction(formData: FormData) {
  const email = String(formData.get("email"));
  if (!email) return { error: "กรุณากรอกอีเมล" };

  const password = String(formData.get("password"));
  if (!password) return { error: "กรุณากรอกรหัสผ่าน" };

  try {
    // ตรวจสอบว่ามีผู้ใช้ในฐานข้อมูลหรือไม่
    const userExists = await prisma.user.findUnique({
      where: { email, isDeleted: false },
    });

    if (!userExists) {
      console.error("User not found:", email);
      return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
    }

    let response;
    try {
      response = await auth.api.signInEmail({
        headers: await headers(),
        body: {
          email,
          password,
        },
        asResponse: true,
      });

      // ตรวจสอบสถานะของการตอบกลับ
      if (!response.ok) {
        // ถ้า response ไม่สำเร็จ สร้าง error ใหม่
        const responseData = await response.json().catch(() => ({}));
        console.error("Auth response not OK:", response.status, responseData);
        throw new Error(
          `Authentication failed: ${
            responseData.message || response.statusText
          }`
        );
      }

      return { error: null };
    } catch (authError) {
      console.error("Authentication error:", authError);

      // ตรวจสอบว่าเป็นข้อผิดพลาดเกี่ยวกับรหัสผ่านหรือไม่
      if (
        authError instanceof Error &&
        authError.message.toLowerCase().includes("invalid password")
      ) {
        return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
      }

      // ส่งต่อข้อผิดพลาดไปยัง error handler ด้านล่าง
      throw authError;
    }
  } catch (error) {
    // จัดการกับข้อความผิดพลาดตามรหัสข้อผิดพลาด
    console.error("Login error details:", error);

    // ตรวจสอบรูปแบบข้อผิดพลาดที่หลากหลาย
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      console.log("Error message lowercase:", errorMessage);

      // ถ้ามี APIError จาก Better Auth
      const errorObj = error as any;
      if (errorObj.code || errorObj.statusCode) {
        console.log(
          "Error code/statusCode:",
          errorObj.code || errorObj.statusCode
        );
      }

      // ตรวจสอบข้อความผิดพลาดเกี่ยวกับผู้ใช้ไม่พบ
      if (
        errorMessage.includes("not found") ||
        errorMessage.includes("no user") ||
        errorMessage.includes("user not found")
      ) {
        return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
      }

      // ตรวจสอบข้อความผิดพลาดเกี่ยวกับรหัสผ่าน
      if (
        errorMessage.includes("password") ||
        errorMessage.includes("invalid password") ||
        errorMessage.includes("credential") ||
        errorMessage.includes("invalid") ||
        errorMessage.includes("authentication failed")
      ) {
        return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
      }

      return { error: error.message };
    }

    return { error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดลองอีกครั้งในภายหลัง" };
  }
}
