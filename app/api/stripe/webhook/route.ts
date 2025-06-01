import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: unknown) {
      console.error(
        "Webhook signature verification failed:",
        err instanceof Error ? err.message : "Unknown error"
      );
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log("Payment succeeded:", paymentIntent.id);

        // Send Discord notification for Stripe webhook
        try {
          const metadata = paymentIntent.metadata;
          if (metadata?.packages) {
            const packages = JSON.parse(metadata.packages);

            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/webhooks/discord`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  type: "stripe_payment_success",
                  data: {
                    paymentIntentId: paymentIntent.id,
                    userName: metadata.userName || "Unknown",
                    userEmail: metadata.userEmail || "Unknown",
                    packages: packages,
                    amount: (paymentIntent.amount / 100).toFixed(2),
                    currency: paymentIntent.currency.toUpperCase(),
                  },
                }),
              }
            );
          }
        } catch (webhookError) {
          console.error(
            "Discord webhook error in Stripe webhook:",
            webhookError
          );
        }
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        console.log("Payment failed:", failedPayment.id);

        // Send Discord notification for failed payment
        try {
          const metadata = failedPayment.metadata;

          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/webhooks/discord`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                type: "payment_failed",
                data: {
                  paymentIntentId: failedPayment.id,
                  userName: metadata?.userName || "Unknown",
                  userEmail: metadata?.userEmail || "Unknown",
                  amount: (failedPayment.amount / 100).toFixed(2),
                  currency: failedPayment.currency.toUpperCase(),
                },
              }),
            }
          );
        } catch (webhookError) {
          console.error(
            "Discord webhook error for failed payment:",
            webhookError
          );
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
