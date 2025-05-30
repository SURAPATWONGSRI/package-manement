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

      await prisma.$executeRaw`
        INSERT INTO package_selections (
          id, "userId", name, email, packages, "payPrice", "startDate", "endDate", paid, "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), ${userData.userId}, ${userData.name}, ${
        userData.email
      },
          ${JSON.stringify(
            userData.packages
          )}::jsonb, ${userData.payPrice.toString()}::decimal(10,2),
          (${
            userData.startDateISO
          }::timestamptz AT TIME ZONE 'Asia/Bangkok')::timestamp,
          (${
            userData.endDateISO
          }::timestamptz AT TIME ZONE 'Asia/Bangkok')::timestamp,
          ${paidStatus}::boolean,
          (NOW() AT TIME ZONE 'Asia/Bangkok')::timestamp,
          (NOW() AT TIME ZONE 'Asia/Bangkok')::timestamp
        )
      `;

      const createdRecord = await prisma.packageSelection.findFirst({
        where: {
          userId: userData.userId,
          payPrice: userData.payPrice.toString(),
        },
        orderBy: { createdAt: "desc" },
      });

      createdSelections.push(createdRecord);
    }

    return NextResponse.json({
      success: true,
      message: "Package selections saved successfully",
      data: createdSelections,
    });
  } catch (error: any) {
    console.error("Error saving package selections:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
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

    const [packageSelections, totalCount] = await Promise.all([
      prisma.packageSelection.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
      }),
      prisma.packageSelection.count(),
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
      stripeCustomerId: selection.stripeCustomerId,
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
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
