"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

interface UpdateUserData {
  userId: string;
  name?: string;
  lineId?: string | null;
  email?: string;
  image?: string | null;
}

export async function updateUserAction({
  userId,
  name,
  lineId,
  email,
  image,
}: UpdateUserData) {
  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    return { error: "Unauthorized" };
  }

  // Verify the user has admin permissions
  if (session.user.role !== "ADMIN") {
    return { error: "Forbidden - You need admin permissions" };
  }

  try {
    // Get current user data
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true, lineId: true, image: true },
    });

    if (!currentUser) {
      return { error: "User not found" };
    }

    // Prepare update data
    const updateData: Record<string, any> = {};

    if (name && name !== currentUser.name) {
      updateData.name = name;
    }

    if (lineId !== undefined && lineId !== currentUser.lineId) {
      // Check if lineId is already in use by another user
      if (lineId) {
        const existingUserWithLineId = await prisma.user.findUnique({
          where: { lineId },
          select: { id: true },
        });

        if (existingUserWithLineId && existingUserWithLineId.id !== userId) {
          return { error: "LINE ID นี้ถูกใช้โดยผู้ใช้รายอื่นแล้ว" };
        }
      }
      updateData.lineId = lineId;
    }

    if (email && email !== currentUser.email) {
      // Check if email is already in use
      const existingUserWithEmail = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
        return { error: "อีเมลนี้ถูกใช้โดยผู้ใช้รายอื่นแล้ว" };
      }

      // For now, just update the email in Prisma
      // Better-auth doesn't expose a direct method for updating email
      updateData.email = email;
    }

    // Update image if provided and different from current
    if (image !== undefined && image !== currentUser.image) {
      updateData.image = image;
    }

    // If we have data to update in prisma
    if (Object.keys(updateData).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user:", error);
    return {
      error: error instanceof Error ? error.message : "Internal server error",
    };
  }
}
