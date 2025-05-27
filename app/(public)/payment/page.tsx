"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client"; // Import useSession for authentication
import { addMonths, format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

// Define interfaces to match schema
interface PackageDetail {
  id: string;
  symbol: string;
  timeframe: string;
}

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession(); // Get current session data

  // Get parameters from URL
  const amount = searchParams.get("amount") || "100.00";
  const payPrice = parseFloat(searchParams.get("payPrice") || "100"); // This will now include the decimal part
  const packagesStr = searchParams.get("packages") || "";
  const startDateStr =
    searchParams.get("startDate") || new Date().toISOString();
  const endDateStr =
    searchParams.get("endDate") || addMonths(new Date(), 3).toISOString();

  // Parse packages string to array
  const packages = packagesStr ? packagesStr.split(",") : [];

  // Get selected symbols and timeframes
  const packageDetails: PackageDetail[] = packages.map((id) => ({
    id,
    symbol: searchParams.get(`symbol${id}`) || "",
    timeframe: searchParams.get(`timeframe${id}`) || "",
  }));

  // Parse start date and calculate end date
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  // Function to handle payment confirmation
  const handlePaymentConfirmation = async () => {
    try {
      setIsSubmitting(true);

      // Check if user is logged in
      if (!session?.user) {
        router.push("/sign-in?callbackUrl=/main");
        return;
      }

      // Create package selections from the selections
      const packageSelections = packageDetails.map((pkg) => ({
        symbol: pkg.symbol,
        timeframe: pkg.timeframe,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        payPrice,
        paid: true, // Set to true since payment is being confirmed
        userId: session.user.id,
        name: session.user.name || "",
        email: session.user.email || "",
      }));

      // Send data to API to save in database
      const response = await fetch("/api/package-selections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selections: packageSelections,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("API Error:", result);
        throw new Error(result.error || "Failed to save package selections");
      }

      console.log("Package selections saved:", result);

      // Navigate to confirmation page
      router.push("/payment/sucess");
    } catch (error) {
      console.error("Error saving package selections:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-md">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        ย้อนกลับ
      </Button>

      <Card className="p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">ชำระเงิน</h1>
          <p className="text-slate-500 text-sm mt-1">
            สแกน QR Code PromptPay เพื่อชำระเงิน
          </p>
        </div>

        {/* QR Code placeholder */}
        <div className="bg-slate-100 rounded-md flex items-center justify-center h-64 mb-6 border">
          <div className="text-center">
            <p className="text-slate-500 mb-2">QR Code Placeholder</p>
            <p className="font-medium">PromptPay QR จะปรากฏที่นี่</p>
          </div>
        </div>

        <div className="border rounded-md p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-slate-500">จำนวนเงิน</p>
              <p className="text-2xl font-bold text-emerald-600">฿{amount}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">แพ็กเกจ</span>
              <span className="font-medium">
                {packages.length === 3
                  ? "ทั้ง 3 แพ็กเกจ"
                  : packages.length > 0
                  ? `แพ็กเกจ ${packages.join(", ")}`
                  : "ไม่ได้เลือกแพ็กเกจ"}
              </span>
            </div>

            {/* Show package details */}
            {packageDetails.map((pkg) => (
              <div key={pkg.id} className="flex justify-between">
                <span className="text-slate-500">แพ็กเกจ {pkg.id}</span>
                <span className="font-medium">
                  {pkg.symbol} / {pkg.timeframe}
                </span>
              </div>
            ))}

            <div className="flex justify-between">
              <span className="text-slate-500">วันเริ่มต้น</span>
              <span className="font-medium">
                {format(startDate, "d MMMM yyyy")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">วันหมดอายุ</span>
              <span className="font-medium">
                {format(endDate, "d MMMM yyyy")}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-md border border-amber-200 mb-6">
          <p className="text-amber-800 text-sm">
            <strong>สำคัญ:</strong> กรุณาชำระเงินตามจำนวนที่ระบุไว้อย่างถูกต้อง
            ระบบจะจับคู่การชำระเงินของคุณโดยใช้เลขทศนิยมเฉพาะนี้
          </p>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          onClick={handlePaymentConfirmation}
          disabled={isSubmitting}
        >
          {isSubmitting ? "กำลังดำเนินการ..." : "ฉันได้ชำระเงินแล้ว"}
        </Button>
      </Card>
    </div>
  );
}
