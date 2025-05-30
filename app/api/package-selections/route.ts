import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Parse request body
    const body = await req.json();
    const { selections } = body;

    console.log("Request body:", body);

    if (!selections || !Array.isArray(selections) || selections.length === 0) {
      console.log("Invalid selections data:", selections);
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    // Map the enum values if needed
    const validateSymbol = (symbol: string) => {
      const validSymbols = ["EURUSD", "USDJPY", "GOLD", "BTCUSD"];
      return validSymbols.includes(symbol) ? symbol : "EURUSD";
    };

    const validateTimeframe = (timeframe: string) => {
      const validTimeframes = ["M15", "M30", "H1", "D1"];
      return validTimeframes.includes(timeframe) ? timeframe : "M15";
    };

    // Create the package selections in the database one by one
    const createdSelections = [];

    // Group selections by userId
    const selectionsByUser = selections.reduce((acc, selection) => {
      // Skip if missing required fields
      if (!selection.userId || !selection.email) {
        console.error("Missing user information in selection:", selection);
        return acc;
      }

      // Initialize array for this user if it doesn't exist
      if (!acc[selection.userId]) {
        acc[selection.userId] = {
          userId: selection.userId,
          name: selection.name || "Unknown",
          email: selection.email || "unknown@example.com",
          packages: [],
          payPrice: 0.0, // Will be overwritten with the actual price
          startDateISO: selection.startDate, // Store ISO string for conversion
          endDateISO: selection.endDate, // Store ISO string for conversion
        };
      }

      // Add this package to the user's packages array
      acc[selection.userId].packages.push({
        symbol: validateSymbol(selection.symbol),
        timeframe: validateTimeframe(selection.timeframe),
        startDate: selection.startDate,
        endDate: selection.endDate,
      });

      // Since we want the total to be 100.xx for all packages,
      // we'll just use the same payPrice value from the selection
      // instead of summing them up
      // This assumes all selections from the same user have the same payPrice
      const priceWithDecimals = parseFloat(selection.payPrice.toString());
      acc[selection.userId].payPrice = parseFloat(priceWithDecimals.toFixed(2));

      return acc;
    }, {});

    // Create one record per user with all their packages
    for (const userId in selectionsByUser) {
      try {
        const userData = selectionsByUser[userId];

        // Debug log to verify the price value before saving
        console.log(
          "About to save price:",
          userData.payPrice,
          "with type:",
          typeof userData.payPrice
        );

        // Get the paid status from the first selection (all should be the same)
        const paidStatus =
          selections.find((s) => s.userId === userData.userId)?.paid ?? false; // Default to false if not specified

        // Use raw SQL to insert with Thailand timezone conversion
        const result = await prisma.$executeRaw`
          INSERT INTO package_selections (
            id,
            "userId",
            name,
            email,
            packages,
            "payPrice",
            "startDate",
            "endDate",
            paid,
            "createdAt",
            "updatedAt"
          ) VALUES (
            gen_random_uuid(),
            ${userData.userId},
            ${userData.name},
            ${userData.email},
            ${JSON.stringify(userData.packages)}::jsonb,
            ${userData.payPrice.toString()}::decimal(10,2),
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

        // Get the created record for response
        const createdRecord = await prisma.packageSelection.findFirst({
          where: {
            userId: userData.userId,
            payPrice: userData.payPrice.toString(),
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        createdSelections.push(createdRecord);
        console.log(
          "Created package selection with Thailand timezone:",
          createdRecord
        );
      } catch (error) {
        console.error("Error creating package selection:", error);
        throw error;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Package selections saved successfully with Thailand timezone",
      data: createdSelections,
    });
  } catch (error: any) {
    console.error("Error saving package selections:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Fetch all package selections from the database
    const packageSelections = await prisma.packageSelection.findMany({
      orderBy: {
        createdAt: "desc",
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

    // Transform the data to ensure proper formatting
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

    return NextResponse.json({
      success: true,
      message: "Package selections retrieved successfully",
      data: formattedSelections,
      count: formattedSelections.length,
    });
  } catch (error: any) {
    console.error("Error fetching package selections:", error);

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
