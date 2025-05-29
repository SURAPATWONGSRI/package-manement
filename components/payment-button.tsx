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
import { Calendar, Package, TrendingUp } from "lucide-react";
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
  const [randomPrice, setRandomPrice] = useState<number | null>(null);

  // Generate random price with 2 decimal places (100.xx THB)
  const generateRandomPrice = () => {
    if (randomPrice === null) {
      // Generate random cents (00-99) for the decimal part
      const randomCents = Math.floor(Math.random() * 100);
      const price = 100 + randomCents / 100;
      setRandomPrice(parseFloat(price.toFixed(2)));
      return price;
    }
    return randomPrice;
  };

  const selectedPackages = Object.entries(selections)
    .filter(([_, selection]) => selection.symbol && selection.timeframe)
    .map(([packageId, selection]) => ({
      packageId: parseInt(packageId),
      symbol: selection.symbol,
      timeframe: selection.timeframe,
    }));

  const totalPrice = selectedPackages.length > 0 ? generateRandomPrice() : 0;
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
      // Don't save to database yet - only show payment modal
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
      // Save to database after successful payment
      const packageSelections = selectedPackages.map((pkg) => ({
        symbol: pkg.symbol,
        timeframe: pkg.timeframe,
        startDate: startDate!.toISOString(), // Send as ISO string, server will convert
        endDate: endDate.toISOString(), // Send as ISO string, server will convert
        payPrice: totalPrice,
        paid: true, // Set to true since payment was successful
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

      console.log("Package selections saved to DB:", dbResult);

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
      console.error("Error saving package selections:", error);
      setShowPaymentModal(false);
      toast.error(
        "ชำระเงินสำเร็จ แต่เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาติดต่อฝ่ายสนับสนุน"
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
      <div className="text-center space-y-4">
        {selectedPackages.length > 0 && (
          <div className="space-y-2">
            <div className="text-lg font-semibold">
              ราคารวม: ฿{totalPrice.toFixed(2)}
            </div>
            <div className="text-sm text-amber-600 bg-amber-50 mt-2 p-2 rounded">
              <strong>สำคัญ:</strong>{" "}
              กรุณาชำระเงินตามจำนวนที่ระบุไว้อย่างถูกต้อง
              ระบบจะจับคู่การชำระเงินของคุณโดยใช้เลขทศนิยมเฉพาะนี้
            </div>
          </div>
        )}
        <Button
          onClick={handlePaymentClick}
          disabled={!isFormValid || loading}
          size="lg"
          className="w-full md:w-auto"
        >
          {loading
            ? "กำลังเตรียมการชำระเงิน..."
            : !session?.user
            ? "เข้าสู่ระบบเพื่อชำระเงิน"
            : isFormValid
            ? "ชำระเงิน"
            : "กรุณาเลือกแพ็คเกจและวันที่"}
        </Button>
      </div>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">รายละเอียดการชำระเงิน</DialogTitle>
            <DialogDescription>
              ตรวจสอบรายละเอียดแพ็คเกจที่เลือกก่อนชำระเงิน
            </DialogDescription>
          </DialogHeader>

          {/* Package Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Package className="h-5 w-5 mr-2" />
                  แพ็คเกจที่เลือก ({selectedPackages.length} แพ็คเกจ)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedPackages.map((pkg, index) => (
                  <div
                    key={pkg.packageId}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-base">
                        Package {pkg.packageId}
                      </h4>
                      <div className="flex space-x-2">
                        <Badge
                          variant="default"
                          className="bg-blue-100 text-blue-800"
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {pkg.symbol}
                        </Badge>
                        <Badge variant="outline">{pkg.timeframe}</Badge>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>
                        สัญลักษณ์การเทรด:{" "}
                        <span className="font-medium">{pkg.symbol}</span>
                      </p>
                      <p>
                        ช่วงเวลา:{" "}
                        <span className="font-medium">{pkg.timeframe}</span>
                      </p>
                    </div>
                  </div>
                ))}
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
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">วันที่เริ่มต้น</p>
                      <p className="font-semibold">
                        {format(startDate, "dd MMMM yyyy", { locale: th })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">วันที่สิ้นสุด</p>
                      <p className="font-semibold">
                        {format(endDate, "dd MMMM yyyy", { locale: th })}
                      </p>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      ระยะเวลา: <span className="font-semibold">3 เดือน</span>
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      เวลาที่บันทึก: ตามเวลาประเทศไทย (UTC+7)
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">สรุปการชำระเงิน</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>จำนวนแพ็คเกจ:</span>
                    <span>{selectedPackages.length} แพ็คเกจ</span>
                  </div>

                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>ยอดรวมทั้งหมด:</span>
                    <span className="text-green-600">
                      ฿{totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-800">
                    <strong>หมายเหตุ:</strong>{" "}
                    ราคานี้รวมทุกแพ็คเกจที่เลือกไว้แล้ว และมีผลใช้งานเป็นเวลา 3
                    เดือน
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Component */}
          {isFormValid && startDate && (
            <StripeCheckout
              amount={totalPrice}
              packages={selectedPackages}
              startDate={startDate}
              endDate={endDate}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
