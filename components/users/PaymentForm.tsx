"use client";

import { Button } from "@/components/ui/button";
import PaymentFormContent from "@/components/users/PaymentFormContent";
import { Suspense } from "react";

export default function PaymentForm() {
  return (
    <Suspense fallback={<PaymentFormSkeleton />}>
      <PaymentFormContent />
    </Suspense>
  );
}

// Skeleton component to show while loading
function PaymentFormSkeleton() {
  return (
    <>
      <div className="border rounded-md p-4 mb-6 animate-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="w-1/3 h-8 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between">
            <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
            <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="flex justify-between">
            <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
            <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="flex justify-between">
            <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
            <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 p-4 rounded-md border border-amber-200 mb-6">
        <div className="h-4 bg-amber-100 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-amber-100 rounded w-full"></div>
      </div>

      <Button disabled className="w-full" size="lg">
        กรุณารอสักครู่...
      </Button>
    </>
  );
}
