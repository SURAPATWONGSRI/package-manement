"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/auth-client";
import { Loader2 } from "lucide-react"; // Import Loader2 from lucide-react
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface ResetPasswordFormProps {
  token: string;
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.target as HTMLFormElement);

    const password = String(formData.get("password"));
    if (!password) return toast.error("กรุณากรอกรหัสผ่าน");

    const confirmPassword = String(formData.get("confirmPassword"));
    if (password !== confirmPassword) {
      return toast.error("รหัสผ่านไม่ตรงกัน");
    }
    if (password.length < 8) {
      return toast.error("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
    }
    await resetPassword({
      newPassword: password,
      token,
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
          toast.success("Reset password successfully");
          router.push("/login");
        },
      },
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
      <div className="grid gap-2">
        <Label htmlFor="password" className="text-sm font-medium">
          New Password
        </Label>
        <Input
          type="password"
          id="password"
          name="password"
          placeholder="Enter Your New Password"
          className="h-10"
        />

        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirm Password
        </Label>
        <Input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Enter Your New Password"
          className="h-10"
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
            Loading...
          </>
        ) : (
          "Reset Password"
        )}
      </Button>
    </form>
  );
};
