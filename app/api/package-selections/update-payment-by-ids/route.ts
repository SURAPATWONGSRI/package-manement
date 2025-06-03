import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { recordIds, paid } = body;

    if (
      !Array.isArray(recordIds) ||
      recordIds.length === 0 ||
      paid === undefined
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: recordIds (array) and paid (boolean)",
        },
        { status: 400 }
      );
    }

    // Update payment status for specific records
    const updatedCount = await prisma.packageSelection.updateMany({
      where: {
        id: {
          in: recordIds,
        },
        paid: false, // Only update unpaid records
      },
      data: {
        paid: paid,
        updatedAt: new Date(),
      },
    });

    if (updatedCount.count === 0) {
      return NextResponse.json(
        { error: "No matching unpaid records found to update" },
        { status: 404 }
      );
    }

    // Fetch the updated records
    const updatedRecords = await prisma.packageSelection.findMany({
      where: {
        id: {
          in: recordIds,
        },
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
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Format the response data
    const formattedRecords = updatedRecords.map((record) => ({
      id: record.id,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      userId: record.userId,
      name: record.name,
      email: record.email,
      symbol: record.symbol,
      timeframe: record.timeframe,
      payPrice: parseFloat(record.payPrice.toString()),
      startDate: record.startDate.toISOString(),
      endDate: record.endDate.toISOString(),
      paid: record.paid,
      user: record.user,
    }));

    return NextResponse.json({
      success: true,
      message: `Payment status updated successfully. ${updatedCount.count} record(s) updated.`,
      data: formattedRecords,
      count: updatedCount.count,
    });
  } catch (error: unknown) {
    console.error("Error updating payment status:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        stack:
          process.env.NODE_ENV === "development" && error instanceof Error
            ? error.stack
            : undefined,
      },
      { status: 500 }
    );
  }
}
