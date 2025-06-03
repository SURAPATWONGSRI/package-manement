import { SymbolType, Timeframe } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const validateSymbol = (symbol: string): SymbolType => {
  const validSymbols = Object.values(SymbolType);
  if (validSymbols.includes(symbol as SymbolType)) {
    return symbol as SymbolType;
  }
  return SymbolType.EURUSD; // Default value
};

const validateTimeframe = (timeframe: string): Timeframe => {
  const validTimeframes = Object.values(Timeframe);
  if (validTimeframes.includes(timeframe as Timeframe)) {
    return timeframe as Timeframe;
  }
  return Timeframe.M15; // Default value
};

export async function POST(req: Request) {
  try {
    const { selections } = await req.json();

    if (!Array.isArray(selections) || selections.length === 0) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    const createdSelections = [];

    // สร้าง record แยกสำหรับแต่ละ package ที่เลือก
    for (const selection of selections) {
      if (!selection.userId || !selection.email) {
        continue; // ข้าม selection ที่ไม่มีข้อมูลครบถ้วน
      }

      const paidStatus = selection.paid ?? false;

      // สร้าง record แยกสำหรับแต่ละ package
      const createdRecord = await prisma.packageSelection.create({
        data: {
          userId: selection.userId,
          name: selection.name || "Unknown",
          email: selection.email || "unknown@example.com",
          symbol: validateSymbol(selection.symbol),
          timeframe: validateTimeframe(selection.timeframe),
          payPrice: selection.payPrice?.toString() || "100.00", // ใช้ราคาที่ส่งมาจาก frontend
          startDate: new Date(selection.startDate),
          endDate: new Date(selection.endDate),
          paid: paidStatus,
        },
      });

      createdSelections.push(createdRecord);
    }

    return NextResponse.json({
      success: true,
      message: `Package selections saved successfully. Created ${createdSelections.length} records.`,
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
      symbol: selection.symbol,
      timeframe: selection.timeframe,
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
