"use client";

import { sendVerificationEmail } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export const SendVerificationEmailForm = () => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.target as HTMLFormElement);
    const email = String(formData.get("email"));

    if (!email) return toast.error("กรุณากรอกอีเมลของคุณ");

    await sendVerificationEmail({
      email,
      callbackURL: "/verify",
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
          toast.success("Verification email sent successfully");
          router.push("/verify/success");
        },
      },
    });
  }
  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div className="grid gap-2">
        <Label htmlFor="email" className="text-sm font-medium">
          อีเมล
        </Label>
        <Input
          type="email"
          id="email"
          name="email"
          placeholder="name@example.com"
          className="h-10"
          autoComplete="email"
        />
        <p className="text-sm text-muted-foreground">
          เราจะส่งลิงก์ยืนยันตัวตนไปยังอีเมลของคุณ
        </p>
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
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            กำลังส่ง...
          </>
        ) : (
          "ส่งอีเมลยืนยันอีกครั้ง"
        )}
      </Button>
    </form>
  );
};
