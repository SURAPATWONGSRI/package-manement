import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const validateSymbol = (symbol: string) =>
  ["EURUSD", "USDJPY", "GOLD", "BTCUSD"].includes(symbol) ? symbol : "EURUSD";

const validateTimeframe = (timeframe: string) =>
  ["M15", "M30", "H1", "D1"].includes(timeframe) ? timeframe : "M15";

export async function POST(req: Request) {
  try {
    const { selections } = await req.json();

    if (!Array.isArray(selections) || selections.length === 0) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    const selectionsByUser = selections.reduce((acc, selection) => {
      if (!selection.userId || !selection.email) return acc;

      if (!acc[selection.userId]) {
        acc[selection.userId] = {
          userId: selection.userId,
          name: selection.name || "Unknown",
          email: selection.email || "unknown@example.com",
          packages: [],
          payPrice: 0.0,
          startDateISO: selection.startDate,
          endDateISO: selection.endDate,
        };
      }

      acc[selection.userId].packages.push({
        symbol: validateSymbol(selection.symbol),
        timeframe: validateTimeframe(selection.timeframe),
        startDate: selection.startDate,
        endDate: selection.endDate,
      });

      acc[selection.userId].payPrice = parseFloat(
        selection.payPrice.toFixed(2)
      );
      return acc;
    }, {});

    const createdSelections = [];

    for (const userId in selectionsByUser) {
      const userData = selectionsByUser[userId];
      const paidStatus =
        selections.find((s) => s.userId === userData.userId)?.paid ?? false;

      // แทนที่ raw SQL ด้วย Prisma client
      const createdRecord = await prisma.packageSelection.create({
        data: {
          userId: userData.userId,
          name: userData.name,
          email: userData.email,
          packages: userData.packages,
          payPrice: userData.payPrice.toString(),
          startDate: new Date(userData.startDateISO),
          endDate: new Date(userData.endDateISO),
          paid: paidStatus,
        },
      });

      createdSelections.push(createdRecord);
    }

    return NextResponse.json({
      success: true,
      message: "Package selections saved successfully",
      data: createdSelections,
    });
  } catch (error: unknown) {
    console.error("Error saving package selections:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = (parseInt(searchParams.get("page") || "1") - 1) * limit;

    // เพิ่ม filters สำหรับใช้ประโยชน์จาก indexes
    const userId = searchParams.get("userId");
    const paid = searchParams.get("paid");
    const email = searchParams.get("email");

    const whereClause: {
      userId?: string;
      paid?: boolean;
      email?: { contains: string; mode: "insensitive" };
    } = {};

    if (userId) whereClause.userId = userId;
    if (paid !== null) whereClause.paid = paid === "true";
    if (email) whereClause.email = { contains: email, mode: "insensitive" };

    const [packageSelections, totalCount] = await Promise.all([
      prisma.packageSelection.findMany({
        where: whereClause, // ใช้ where clause เพื่อใช้ประโยชน์จาก indexes
        take: limit,
        skip: offset,
        orderBy: { createdAt: "asc" }, // index ที่ createdAt จะช่วยที่นี่
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      }),
      prisma.packageSelection.count({ where: whereClause }),
    ]);

    const formattedSelections = packageSelections.map((selection) => ({
      id: selection.id,
      createdAt: selection.createdAt.toISOString(),
      updatedAt: selection.updatedAt.toISOString(),
      userId: selection.userId,
      name: selection.name,
      email: selection.email,
      packages: selection.packages,
      payPrice: parseFloat(selection.payPrice.toString()),
      startDate: selection.startDate.toISOString(),
      endDate: selection.endDate.toISOString(),
      paid: selection.paid,
      user: selection.user,
    }));

    return NextResponse.json(
      {
        success: true,
        data: formattedSelections,
        total: totalCount,
        page: Math.floor(offset / limit) + 1,
        limit,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
