import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Define the type for the query result
interface QueryResult {
  id: string;
  userId: string;
  name: string;
  email: string;
  packages: string;
  payPrice: string;
  startDate: Date;
  endDate: Date;
  paid: boolean;
  stripeCustomerId: string;
  createdAt: Date;
  updatedAt: Date;
}

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
    // Use Thailand timezone for updatedAt
    const updatedRecord = await prisma.$executeRaw`
      UPDATE package_selections
      SET
        paid = ${paid}::boolean,
        "updatedAt" = (NOW() AT TIME ZONE 'Asia/Bangkok')::timestamp
      WHERE
        "userId" = ${userId}
        AND "payPrice" = ${payPrice.toString()}::decimal(10,2)
        AND paid = false
    `;

    if (updatedRecord === 0) {
      return NextResponse.json(
        { error: "No matching unpaid records found to update" },
        { status: 404 }
      );
    }

    // Fetch the updated record(s) with Thailand timezone
    const updatedRecords = await prisma.$queryRaw`
      SELECT
        id,
        "userId",
        name,
        email,
        packages,
        "payPrice",
        "startDate" AT TIME ZONE 'Asia/Bangkok' as "startDate",
        "endDate" AT TIME ZONE 'Asia/Bangkok' as "endDate",
        paid,
        "stripeCustomerId",
        "createdAt" AT TIME ZONE 'Asia/Bangkok' as "createdAt",
        "updatedAt" AT TIME ZONE 'Asia/Bangkok' as "updatedAt"
      FROM package_selections
      WHERE
        "userId" = ${userId}
        AND "payPrice" = ${payPrice.toString()}::decimal(10,2)
        AND paid = ${paid}::boolean
      ORDER BY "updatedAt" DESC
    `;

    // Fetch user data for the records
    const users = await prisma.user.findMany({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
      },
    });

    const user = users[0] || null;

    // Format the response data
    const formattedRecords = (updatedRecords as QueryResult[]).map(
      (record) => ({
        ...record,
        createdAt: new Date(record.createdAt).toISOString(),
        updatedAt: new Date(record.updatedAt).toISOString(),
        startDate: new Date(record.startDate).toISOString(),
        endDate: new Date(record.endDate).toISOString(),
        payPrice: parseFloat(record.payPrice.toString()),
        user: user,
      })
    );

    return NextResponse.json({
      success: true,
      message: `Payment status updated successfully in Thailand timezone. ${updatedRecord} record(s) updated.`,
      data: formattedRecords,
      count: Number(updatedRecord),
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
