import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { userId, payPrice, paid } = body;

    if (!userId || payPrice === undefined || paid === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: userId, payPrice, paid" },
        { status: 400 }
      );
    }

    // Update the payment status for the most recent record matching userId and payPrice
    const updatedRecord = await prisma.packageSelection.updateMany({
      where: {
        userId: userId,
        payPrice: payPrice.toString(),
        paid: false, // Only update records that are currently unpaid
      },
      data: {
        paid: paid,
        updatedAt: new Date(),
      },
    });

    if (updatedRecord.count === 0) {
      return NextResponse.json(
        { error: "No matching unpaid records found to update" },
        { status: 404 }
      );
    }

    // Fetch the updated record(s) to return
    const updatedRecords = await prisma.packageSelection.findMany({
      where: {
        userId: userId,
        payPrice: payPrice.toString(),
        paid: paid,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Payment status updated successfully. ${updatedRecord.count} record(s) updated.`,
      data: updatedRecords,
      count: updatedRecord.count,
    });
  } catch (error: any) {
    console.error("Error updating payment status:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
