"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PaymentForm from "@/components/users/PaymentForm";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaymentPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-10 max-w-md">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        ย้อนกลับ
      </Button>

      <Card className="p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">ชำระเงิน</h1>
          <p className="text-muted-foreground text-sm mt-1">
            สแกน QR Code เพื่อชำระเงิน
          </p>
        </div>

        {/* QR Code placeholder */}
        <div className="bg-secondary rounded-md flex items-center justify-center h-64 mb-6 border">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">QR Code Placeholder</p>
            <p className="font-medium">PromptPay QR จะปรากฏที่นี่</p>
          </div>
        </div>

        <PaymentForm />
      </Card>
    </div>
  );
}
