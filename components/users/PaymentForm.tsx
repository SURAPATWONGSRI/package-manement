"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function PaymentForm() {
  return (
    <div className="container mx-auto py-10 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>การชำระเงิน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            ระบบการชำระเงินได้ถูกย้ายไปที่หน้าหลัก
            กรุณาเลือกแพ็คเกจและชำระเงินผ่าน Stripe
          </p>
          <Button asChild className="w-full">
            <Link href="/main">ไปยังหน้าเลือกแพ็คเกจ</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
