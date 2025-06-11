import { NextResponse } from "next/server";

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL!;

// Define types for webhook data
interface Package {
  packageId: string;
  symbol: string;
  timeframe: string;
}

interface PaymentSuccessData {
  userName: string;
  userEmail: string;
  totalPrice: number;
  packages: Package[];
  startDate: string;
  endDate: string;
}

interface StripePaymentSuccessData {
  userName: string;
  userEmail: string;
  amount: string;
  currency: string;
  paymentIntentId: string;
  packages: Package[];
}

interface PaymentFailedData {
  userName: string;
  userEmail: string;
  amount: string;
  currency: string;
  paymentIntentId: string;
}

type WebhookData =
  | PaymentSuccessData
  | StripePaymentSuccessData
  | PaymentFailedData;

// Helper function to create package list
function createPackageList(packages: Package[]) {
  return packages
    .map(
      (pkg) => `• Package ${pkg.packageId}: ${pkg.symbol} (${pkg.timeframe})`
    )
    .join("\n");
}

// Helper function to create Discord embed
function createDiscordEmbed(type: string, data: WebhookData) {
  const baseEmbed = {
    timestamp: new Date().toISOString(),
  };

  switch (type) {
    case "payment_success":
      const successData = data as PaymentSuccessData;
      return {
        embeds: [
          {
            ...baseEmbed,
            title: "🎉 ชำระเงินสำเร็จ",
            color: 0x00ff00,
            fields: [
              {
                name: "👤 ลูกค้า",
                value: `${successData.userName}\n${successData.userEmail}`,
                inline: true,
              },
              {
                name: "💰 ยอดชำระ",
                value: `฿${successData.totalPrice.toFixed(2)}`,
                inline: true,
              },
              {
                name: "📦 แพ็คเกจที่เลือก",
                value: createPackageList(successData.packages),
                inline: false,
              },
              {
                name: "📅 ระยะเวลาใช้งาน",
                value: `${successData.startDate} ถึง ${successData.endDate}`,
                inline: false,
              },
            ],
            footer: { text: "Package Management System" },
          },
        ],
      };

    case "stripe_payment_success":
      const stripeData = data as StripePaymentSuccessData;
      return {
        embeds: [
          {
            ...baseEmbed,
            title: "💳 Stripe Payment Confirmed",
            color: 0x0099ff,
            fields: [
              {
                name: "👤 Customer",
                value: `${stripeData.userName}\n${stripeData.userEmail}`,
                inline: true,
              },
              {
                name: "💰 Amount",
                value: `${stripeData.amount} ${stripeData.currency}`,
                inline: true,
              },
              {
                name: "🔗 Payment Intent ID",
                value: stripeData.paymentIntentId,
                inline: true,
              },
              {
                name: "📦 Packages",
                value: createPackageList(stripeData.packages),
                inline: false,
              },
            ],
            footer: { text: "Stripe Webhook" },
          },
        ],
      };

    case "payment_failed":
      const failedData = data as PaymentFailedData;
      return {
        embeds: [
          {
            ...baseEmbed,
            title: "❌ ชำระเงินไม่สำเร็จ",
            color: 0xff0000,
            fields: [
              {
                name: "👤 ลูกค้า",
                value: `${failedData.userName}\n${failedData.userEmail}`,
                inline: true,
              },
              {
                name: "💰 ยอดเงิน",
                value: `${failedData.amount} ${failedData.currency}`,
                inline: true,
              },
              {
                name: "🔗 Payment Intent ID",
                value: failedData.paymentIntentId,
                inline: true,
              },
            ],
            footer: { text: "Payment Failed Alert" },
          },
        ],
      };

    default:
      throw new Error("Invalid webhook type");
  }
}

export async function POST(req: Request) {
  try {
    // Skip Discord webhook in development if URL is not set
    if (!DISCORD_WEBHOOK_URL) {
      console.log("Discord webhook URL not configured, skipping...");
      return NextResponse.json({ success: true, skipped: true });
    }

    const { type, data } = await req.json();

    // Create Discord message
    const discordMessage = createDiscordEmbed(type, data);

    // Send to Discord with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const discordResponse = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordMessage),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!discordResponse.ok) {
        const errorText = await discordResponse.text();
        console.error("Discord webhook error:", {
          status: discordResponse.status,
          statusText: discordResponse.statusText,
          body: errorText,
        });
        throw new Error(`Discord webhook failed: ${discordResponse.status}`);
      }

      console.log("Discord webhook sent successfully for type:", type);
      return NextResponse.json({ success: true });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error: unknown) {
    console.error("Discord webhook error:", error);
    return NextResponse.json(
      {
        error: "Webhook failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
