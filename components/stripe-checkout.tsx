"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface Package {
  packageId: number;
  symbol: string;
  timeframe: string;
}

interface StripeCheckoutProps {
  amount: number;
  packages: Package[];
  startDate: Date;
  endDate: Date;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

export function StripeCheckout({
  amount,
  packages,
  startDate,
  endDate,
  onPaymentSuccess,
  onPaymentError,
}: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate session before creating payment intent
      if (!session?.user?.id) {
        throw new Error("กรุณาเข้าสู่ระบบก่อนทำการชำระเงิน");
      }

      const response = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          currency: "thb",
          metadata: {
            userId: session.user.id,
            userName: session.user.name || "",
            userEmail: session.user.email || "",
            packages: JSON.stringify(packages),
            startDate: startDate.toISOString(), // Send as ISO string
            endDate: endDate.toISOString(), // Send as ISO string
            payPrice: amount.toString(),
          },
        }),
      });

      const data = await response.json();

      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        throw new Error(data.error || "Failed to create payment intent");
      }
    } catch (error) {
      console.error("Error creating payment intent:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการสร้างการชำระเงิน";
      setError(errorMessage);
      onPaymentError?.(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button
            onClick={() => {
              setError(null);
              createPaymentIntent();
            }}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            ลองอีกครั้ง
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!clientSecret) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardDescription>
            คลิกปุ่มด้านล่างเพื่อสร้าง QR Code สำหรับชำระเงิน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={createPaymentIntent}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังสร้าง QR Code...
              </>
            ) : (
              "สร้าง QR Code สำหรับชำระเงิน"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#3b82f6",
        colorBackground: "#ffffff",
        colorText: "#374151",
        colorDanger: "#ef4444",
        borderRadius: "8px",
      },
    },
  };

  return (
    <Elements options={options} stripe={stripePromise}>
      <PaymentForm
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
}

function PaymentForm({
  onPaymentSuccess,
  onPaymentError,
}: {
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPaymentError(null);

    if (!stripe || !elements) {
      const error = "ระบบชำระเงินยังไม่พร้อม กรุณาลองใหม่อีกครั้ง";
      setPaymentError(error);
      onPaymentError?.(error);
      toast.error(error);
      return;
    }

    setLoading(true);

    try {
      const { error: paymentError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          redirect: "if_required",
        });

      if (paymentError) {
        console.error("Payment failed:", paymentError);
        const errorMessage = paymentError.message || "การชำระเงินไม่สำเร็จ";
        setPaymentError(errorMessage);
        onPaymentError?.(errorMessage);
        toast.error("ชำระเงินไม่สำเร็จ: " + errorMessage);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment succeeded - call success callback
        onPaymentSuccess?.();
      } else {
        const errorMessage = "การชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
        setPaymentError(errorMessage);
        onPaymentError?.(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage = "เกิดข้อผิดพลาดระหว่างการชำระเงิน";
      setPaymentError(errorMessage);
      onPaymentError?.(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>ชำระเงินด้วย PromptPay</CardTitle>
          <CardDescription>
            สแกน QR Code ด้วยแอปธนาคารของคุณเพื่อชำระเงิน
          </CardDescription>
        </CardHeader>
      </Card>

      {paymentError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{paymentError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardContent className="pt-6">
            <PaymentElement
              options={{
                layout: "tabs",
              }}
            />
          </CardContent>
        </Card>
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังดำเนินการ...
            </>
          ) : (
            "ยืนยันการชำระเงิน"
          )}
        </Button>
      </form>
    </div>
  );
}
