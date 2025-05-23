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
