import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const LineSeedTH = localFont({
  src: [
    {
      path: "../public/fonts/TH/LINESeedSansTH_W_Th.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/fonts/TH/LINESeedSansTH_W_Rg.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/TH/LINESeedSansTH_W_Bd.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../public/fonts/TH/LINESeedSansTH_W_XBd.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-lineseed-th",
  display: "swap",
});

const LineSeedEN = localFont({
  src: [
    {
      path: "../public/fonts/EN/LINESeedSans_W_Th.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/fonts/EN/LINESeedSans_W_Rg.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../public/fonts/EN/LINESeedSans_W_Bd.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/EN/LINESeedSans_W_XBd.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-lineseed-en",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Package Management",
    default: "Package Management",
  },
  description:
    "ระบบจัดการพัสดุที่ทันสมัย ช่วยให้คุณบริหารพัสดุได้อย่างมีประสิทธิภาพ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${LineSeedTH.variable} ${LineSeedEN.variable}`}>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
