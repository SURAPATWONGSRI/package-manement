"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useSession } from "@/lib/auth-client";
import { addMonths, format } from "date-fns";
import { th } from "date-fns/locale";
import { Calendar, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { StripeCheckout } from "./stripe-checkout";

export interface PackageSelections {
  [packageId: number]: {
    symbol: string;
    timeframe: string;
  };
}

interface PaymentButtonProps {
  startDate: Date | undefined;
  selections: PackageSelections;
}

export function PaymentButton({ startDate, selections }: PaymentButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [packagePrices, setPackagePrices] = useState<Map<number, number>>(
    new Map()
  );
  const [createdRecordIds, setCreatedRecordIds] = useState<string[]>([]);

  // Generate unique random price for each package with 2 decimal places
  const generateUniquePrice = (packageId: number): number => {
    if (packagePrices.has(packageId)) {
      return packagePrices.get(packageId)!;
    }

    let newPrice: number;
    let attempts = 0;
    const maxAttempts = 1000;

    do {
      // Generate random decimal part (00-99)
      const randomCents = Math.floor(Math.random() * 100);
      newPrice = parseFloat((100 + randomCents / 100).toFixed(2));
      attempts++;
    } while (
      Array.from(packagePrices.values()).includes(newPrice) &&
      attempts < maxAttempts
    );

    // If we couldn't find a unique price after many attempts, use timestamp-based approach
    if (attempts >= maxAttempts) {
      const timestamp = Date.now() % 10000; // Last 4 digits of timestamp
      const cents = timestamp % 100; // Convert to cents (00-99)
      newPrice = parseFloat((100 + cents / 100).toFixed(2));
    }

    setPackagePrices((prev) => new Map(prev).set(packageId, newPrice));
    return newPrice;
  };

  const selectedPackages = Object.entries(selections)
    .filter(([, selection]) => selection.symbol && selection.timeframe)
    .map(([packageId, selection]) => {
      const pkgId = parseInt(packageId);
      const price = generateUniquePrice(pkgId);
      return {
        packageId: pkgId,
        symbol: selection.symbol,
        timeframe: selection.timeframe,
        price: price,
      };
    });

  const totalPrice = selectedPackages.reduce((sum, pkg) => sum + pkg.price, 0);
  const isFormValid = startDate && selectedPackages.length > 0;
  const endDate = startDate ? addMonths(startDate, 3) : new Date();

  const handlePaymentClick = async () => {
    if (!session?.user) {
      router.push("/sign-in?callbackUrl=/main");
      return;
    }

    if (!isFormValid) {
      toast.error("กรุณาเลือกวันที่เริ่มต้นและแพ็คเกจอย่างน้อย 1 แพ็คเกจ");
      return;
    }

    try {
      setLoading(true);

      // Save to database first with paid=false
      const packageSelections = selectedPackages.map((pkg) => ({
        symbol: pkg.symbol,
        timeframe: pkg.timeframe,
        startDate: startDate!.toISOString(),
        endDate: endDate.toISOString(),
        payPrice: pkg.price, // ใช้ราคาเฉพาะของแต่ละแพ็คเกจ
        paid: false, // Set to false initially
        userId: session!.user.id,
        name: session!.user.name || "",
        email: session!.user.email || "",
      }));

      const dbResponse = await fetch("/api/package-selections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selections: packageSelections,
        }),
      });

      const dbResult = await dbResponse.json();

      if (!dbResponse.ok) {
        console.error("Database Error:", dbResult);
        throw new Error(dbResult.error || "Failed to save package selections");
      }

      console.log("Package selections saved to DB with paid=false:", dbResult);

      // เก็บ record IDs สำหรับใช้ในการอัพเดทสถานะการชำระเงิน
      if (dbResult.data && Array.isArray(dbResult.data)) {
        const recordIds = dbResult.data.map(
          (record: { id: string }) => record.id
        );
        setCreatedRecordIds(recordIds);
      }

      // Now show payment modal
      setShowPaymentModal(true);
    } catch (error) {
      console.error("Error in payment process:", error);
      toast.error("เกิดข้อผิดพลาดในการเตรียมการชำระเงิน");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async () => {
    try {
      // Update payment status to paid=true for all created records
      const updateResponse = await fetch(
        "/api/package-selections/update-payment-by-ids",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recordIds: createdRecordIds, // ส่ง record IDs ที่สร้างไว้แล้ว
            paid: true,
          }),
        }
      );

      const updateResult = await updateResponse.json();

      if (!updateResponse.ok) {
        console.error("Update Error:", updateResult);
        throw new Error(
          updateResult.error || "Failed to update payment status"
        );
      }

      console.log("Payment status updated to paid=true:", updateResult);

      // Send Discord webhook notification
      try {
        await fetch("/api/webhooks/discord", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "payment_success",
            data: {
              userName: session!.user.name,
              userEmail: session!.user.email,
              packages: selectedPackages,
              totalPrice: totalPrice,
              startDate: format(startDate!, "dd MMMM yyyy", { locale: th }),
              endDate: format(endDate, "dd MMMM yyyy", { locale: th }),
            },
          }),
        });
      } catch (webhookError) {
        console.error("Discord webhook error:", webhookError);
        // Don't throw error for webhook failure, payment was successful
      }

      setShowPaymentModal(false);
      toast.success("ชำระเงินสำเร็จ! ");

      // Redirect to public success page
      router.push("/payment/success");
    } catch (error) {
      console.error("Error updating payment status:", error);
      setShowPaymentModal(false);
      toast.error(
        "ชำระเงินสำเร็จ แต่เกิดข้อผิดพลาดในการอัพเดทสถานะ กรุณาติดต่อฝ่ายสนับสนุน"
      );
      // Still redirect to success page since payment went through
      router.push("/payment/success");
    }
  };

  const handlePaymentError = (error: string) => {
    toast.error("ชำระเงินไม่สำเร็จ: " + error);
    setShowPaymentModal(false);
  };

  return (
    <>
      <div className="grid gap-6">
        <div className="grid place-items-center">
          <Button
            onClick={handlePaymentClick}
            disabled={!isFormValid || loading}
            size="lg"
            className="w-full max-w-md"
          >
            {loading
              ? "กำลังเตรียมการชำระเงิน..."
              : !session?.user
              ? "เข้าสู่ระบบเพื่อชำระเงิน"
              : isFormValid
              ? "ชำระเงิน"
              : "กรุณาเลือกแพ็คเกจ"}
          </Button>
        </div>
      </div>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">รายละเอียดการชำระเงิน</DialogTitle>
            <DialogDescription>
              ตรวจสอบรายละเอียดแพ็คเกจที่เลือกก่อนชำระเงิน
            </DialogDescription>
          </DialogHeader>

          {/* Main Layout: Left side for details, Right side for payment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Package Details */}
            <div className="space-y-6">
              {/* Package Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Package className="h-5 w-5 mr-2" />
                    แพ็คเกจที่เลือก ({selectedPackages.length} แพ็คเกจ)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {selectedPackages.map((pkg) => (
                      <div
                        key={pkg.packageId}
                        className="border rounded-lg p-4"
                      >
                        <div className="grid gap-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-base">
                              Package {pkg.packageId}
                            </h4>
                            <div className="flex space-x-2">
                              <Badge variant="default">{pkg.symbol}</Badge>
                              <Badge variant="outline">{pkg.timeframe}</Badge>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
                            <div>
                              <span>Symbol: </span>
                              <span className="font-medium">{pkg.symbol}</span>
                            </div>
                            <div>
                              <span>Period: </span>
                              <span className="font-medium">
                                {pkg.timeframe}
                              </span>
                            </div>
                            <div>
                              <span>Price: </span>
                              <span className="font-medium text-emerald-600">
                                ฿{pkg.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Date Information */}
              {startDate && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-lg">
                      <Calendar className="h-5 w-5 mr-2" />
                      ระยะเวลาใช้งาน
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Period Start
                        </p>
                        <p className="font-semibold">
                          {format(startDate, "dd MMMM yyyy", { locale: th })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Period End
                        </p>
                        <p className="font-semibold">
                          {format(endDate, "dd MMMM yyyy", { locale: th })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Side - Payment Summary and Checkout */}
            <div className="space-y-6">
              {/* Payment Summary */}
              <Card className="sticky top-0">
                <CardHeader>
                  <CardTitle className="text-lg">สรุปการชำระเงิน</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>จำนวนแพ็คเกจ:</span>
                        <span>{selectedPackages.length} แพ็คเกจ</span>
                      </div>

                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>ยอดรวมทั้งหมด:</span>
                        <span className="text-emerald-500">
                          ฿{totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Payment Component */}
                    {isFormValid && startDate && (
                      <div className="mt-6">
                        <StripeCheckout
                          amount={totalPrice}
                          packages={selectedPackages}
                          startDate={startDate}
                          endDate={endDate}
                          onPaymentSuccess={handlePaymentSuccess}
                          onPaymentError={handlePaymentError}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Additional Information */}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
