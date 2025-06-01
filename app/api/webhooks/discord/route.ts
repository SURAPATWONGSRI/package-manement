import { NextResponse } from "next/server";

const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1377595317960179742/y9lBmIRH4LOYf2KVdeBrVOQagYQ9vWcFXVSRnJmnpKG3G3cgPgPAHwDGDW0HK48B-HnN";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, data } = body;

    let discordMessage;

    switch (type) {
      case "payment_success":
        const {
          userName,
          userEmail,
          packages,
          totalPrice,
          startDate,
          endDate,
        } = data;
        const packageList = packages
          .map(
            (pkg: { packageId: string; symbol: string; timeframe: string }) =>
              `• Package ${pkg.packageId}: ${pkg.symbol} (${pkg.timeframe})`
          )
          .join("\n");

        discordMessage = {
          embeds: [
            {
              title: "🎉 ชำระเงินสำเร็จ",
              color: 0x00ff00, // Green color
              fields: [
                {
                  name: "👤 ลูกค้า",
                  value: `${userName}\n${userEmail}`,
                  inline: true,
                },
                {
                  name: "💰 ยอดชำระ",
                  value: `฿${totalPrice.toFixed(2)}`,
                  inline: true,
                },
                {
                  name: "📦 แพ็คเกจที่เลือก",
                  value: packageList,
                  inline: false,
                },
                {
                  name: "📅 ระยะเวลาใช้งาน",
                  value: `${startDate} ถึง ${endDate}`,
                  inline: false,
                },
              ],
              timestamp: new Date().toISOString(),
              footer: {
                text: "Package Management System",
              },
            },
          ],
        };
        break;

      case "stripe_payment_success":
        const {
          paymentIntentId,
          userName: stripeUserName,
          userEmail: stripeUserEmail,
          packages: stripePackages,
          amount,
          currency,
        } = data;
        const stripePackageList = stripePackages
          .map(
            (pkg: { packageId: string; symbol: string; timeframe: string }) =>
              `• Package ${pkg.packageId}: ${pkg.symbol} (${pkg.timeframe})`
          )
          .join("\n");

        discordMessage = {
          embeds: [
            {
              title: "💳 Stripe Payment Confirmed",
              color: 0x0099ff, // Blue color
              fields: [
                {
                  name: "👤 Customer",
                  value: `${stripeUserName}\n${stripeUserEmail}`,
                  inline: true,
                },
                {
                  name: "💰 Amount",
                  value: `${amount} ${currency}`,
                  inline: true,
                },
                {
                  name: "🔗 Payment Intent ID",
                  value: paymentIntentId,
                  inline: true,
                },
                {
                  name: "📦 Packages",
                  value: stripePackageList,
                  inline: false,
                },
              ],
              timestamp: new Date().toISOString(),
              footer: {
                text: "Stripe Webhook",
              },
            },
          ],
        };
        break;

      case "payment_failed":
        const {
          paymentIntentId: failedId,
          userName: failedUserName,
          userEmail: failedUserEmail,
          amount: failedAmount,
          currency: failedCurrency,
        } = data;

        discordMessage = {
          embeds: [
            {
              title: "❌ ชำระเงินไม่สำเร็จ",
              color: 0xff0000, // Red color
              fields: [
                {
                  name: "👤 ลูกค้า",
                  value: `${failedUserName}\n${failedUserEmail}`,
                  inline: true,
                },
                {
                  name: "💰 ยอดเงิน",
                  value: `${failedAmount} ${failedCurrency}`,
                  inline: true,
                },
                {
                  name: "🔗 Payment Intent ID",
                  value: failedId,
                  inline: true,
                },
              ],
              timestamp: new Date().toISOString(),
              footer: {
                text: "Payment Failed Alert",
              },
            },
          ],
        };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid webhook type" },
          { status: 400 }
        );
    }

    // Send to Discord
    const discordResponse = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(discordMessage),
    });

    if (!discordResponse.ok) {
      throw new Error(`Discord webhook failed: ${discordResponse.status}`);
    }

    console.log("Discord webhook sent successfully for type:", type);
    return NextResponse.json({ success: true });
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
