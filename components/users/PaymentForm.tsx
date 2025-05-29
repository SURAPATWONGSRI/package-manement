"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { addMonths } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import PaymentDetails from "./PaymentDetails";

// Define interfaces to match schema
interface PackageDetail {
  id: string;
  symbol: string;
  timeframe: string;
}

export default function PaymentForm() {
  return (
    <Suspense fallback={<PaymentFormSkeleton />}>
      <PaymentFormContent />
    </Suspense>
  );
}

function PaymentFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();

  // Get parameters from URL
  const amount = searchParams.get("amount") || "100.00";
  const payPrice = parseFloat(searchParams.get("payPrice") || "100");
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
    <>
      <PaymentDetails
        amount={amount}
        packages={packages}
        packageDetails={packageDetails}
        startDate={startDate}
        endDate={endDate}
      />

      <Card className="mb-6 bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <p className="text-amber-800 text-sm">
            <strong>สำคัญ:</strong> กรุณาชำระเงินตามจำนวนที่ระบุไว้อย่างถูกต้อง
            ระบบจะจับคู่การชำระเงินของคุณโดยใช้เลขทศนิยมเฉพาะนี้
          </p>
        </CardContent>
      </Card>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        onClick={handlePaymentConfirmation}
        disabled={isSubmitting}
      >
        {isSubmitting ? "กำลังดำเนินการ..." : "ฉันได้ชำระเงินแล้ว"}
      </Button>
    </>
  );
}

// Skeleton component to show while loading
function PaymentFormSkeleton() {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Card className="mb-6">
        <CardHeader>
          <Skeleton className="h-8 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6 bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <Skeleton className="h-4 w-3/4 mb-2 bg-amber-100" />
          <Skeleton className="h-4 w-full bg-amber-100" />
        </CardContent>
      </Card>

      <Button disabled className="w-full" size="lg" type="submit">
        กรุณารอสักครู่...
      </Button>
    </form>
  );
}
