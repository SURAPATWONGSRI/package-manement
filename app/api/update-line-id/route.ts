import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, lineId } = await request.json();

    if (!email || !lineId) {
      return NextResponse.json(
        { error: "Missing email or lineId" },
        { status: 400 }
      );
    }

    // Check if lineId is already in use by another user
    const existingUser = await prisma.user.findUnique({
      where: { lineId },
      select: { email: true },
    });

    if (existingUser && existingUser.email !== email) {
      return NextResponse.json(
        { error: "LINE ID นี้ถูกใช้โดยผู้ใช้รายอื่นแล้ว" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { email },
      data: { lineId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to update lineId" },
      { status: 500 }
    );
  }
}
