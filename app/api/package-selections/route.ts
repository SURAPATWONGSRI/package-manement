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
          startDate: new Date(selection.startDate),
          endDate: new Date(selection.endDate),
        };
      }

      // Add this package to the user's packages array
      acc[selection.userId].packages.push({
        symbol: validateSymbol(selection.symbol),
        timeframe: validateTimeframe(selection.timeframe),
        startDate: new Date(selection.startDate),
        endDate: new Date(selection.endDate),
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

        const result = await prisma.packageSelection.create({
          data: {
            userId: userData.userId,
            name: userData.name,
            email: userData.email,
            packages: userData.packages,
            payPrice: userData.payPrice.toString(), // Convert to string for Prisma Decimal
            startDate: userData.startDate,
            endDate: userData.endDate,
            paid: true,
          },
        });

        createdSelections.push(result);
        console.log("Created package selection:", result);
      } catch (error) {
        console.error("Error creating package selection:", error);
        throw error;
      }
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
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
