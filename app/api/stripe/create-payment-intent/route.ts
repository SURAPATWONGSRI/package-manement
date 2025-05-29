import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, currency = "thb", metadata } = body;

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!metadata?.userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Create payment intent with PromptPay support
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      payment_method_types: ["promptpay"],
      metadata: {
        userId: metadata.userId,
        userName: metadata.userName || "",
        userEmail: metadata.userEmail || "",
        packages: metadata.packages || "[]",
        startDate: metadata.startDate || new Date().toISOString(),
        endDate: metadata.endDate || new Date().toISOString(),
        payPrice: metadata.payPrice || amount.toString(),
        integration: "package_management",
      },
    });

    console.log(
      "Created payment intent with metadata:",
      paymentIntent.metadata
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
