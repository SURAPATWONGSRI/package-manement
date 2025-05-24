"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { headers } from "next/headers";

export async function deleteUserAction({ userId }: { userId: string }) {
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) throw new Error("Unauthorized");

  // แก้ไขตรงนี้: ตรวจสอบบทบาทที่ role ไม่ใช่ id
  if (session.user.role !== "ADMIN" || session.user.id === userId) {
    throw new Error("FORBIDDEN");
  }

  try {
    await prisma.user.delete({
      where: {
        id: userId,
        role: "USER", // ตรวจสอบว่าลบได้เฉพาะผู้ใช้ที่มีบทบาทเป็น USER เท่านั้น
      },
    });

    // ไม่จำเป็นต้องเช็คเงื่อนไขนี้อีก เพราะเราเช็คแล้วว่า session.user.id !== userId
    // if (session.user.id === userId) {
    //   await auth.api.signOut({
    //     headers: headersList,
    //   });
    //   redirect("/login");
    // }

    revalidatePath("/admin/users"); // แก้ไขเส้นทางให้ถูกต้อง
    return { error: null };
  } catch (err) {
    if (isRedirectError(err)) {
      throw err;
    }
    if (err instanceof Error) {
      return { error: err.message };
    }
    return { error: "Internal Server Error" };
  }
}
