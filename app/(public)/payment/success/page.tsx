"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="container mx-auto py-10 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 text-green-600">
            <CheckCircle className="h-full w-full" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            ชำระเงินสำเร็จ!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">ขอบคุณสำหรับการชำระเงิน</p>
          <div className="space-y-2">
            <Button variant="default" asChild className="w-full">
              <Link href="/main">กลับไปหน้าแรก</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
