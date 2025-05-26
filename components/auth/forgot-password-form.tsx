"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react"; // Import Lucide icons
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { forgetPassword } from "@/lib/auth-client";

export const ForgotPasswordForm = () => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.target as HTMLFormElement);
    const email = String(formData.get("email"));

    if (!email) return toast.error("กรุณากรอกอีเมลของคุณ");

    await forgetPassword({
      email,
      redirectTo: "/reset-password",
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          toast.success("Reset link sent to your email!");
          router.push("/forgot-password/success");
        },
      },
    });
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div className="grid gap-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          type="email"
          id="email"
          name="email"
          placeholder="name@example.com"
          className="h-10"
          autoComplete="email"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        size="default"
        variant="default"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            กำลังส่ง...
          </>
        ) : (
          <>Send Reset Link</>
        )}
      </Button>
    </form>
  );
};
