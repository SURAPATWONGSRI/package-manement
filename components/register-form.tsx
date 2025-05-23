"use client";

import { signUp } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

// ✅ แบบใหม่: เรียก API route ไปอัปเดต lineId หลังสมัคร
async function updateLineId(email: string, lineId: string) {
  const res = await fetch("/api/update-line-id", {
    method: "POST",
    body: JSON.stringify({ email, lineId }),
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Failed to update lineId");
  }
}

const RegisterForm = () => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.target as HTMLFormElement);

    const name = String(formData.get("name"));
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));
    const confirmPassword = String(formData.get("confirmPassword"));
    const lineId = String(formData.get("lineId") || "");

    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill all required fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await signUp.email(
        { name, email, password },
        {
          onRequest: () => setIsPending(true),
          onResponse: () => setIsPending(false),
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
          onSuccess: async () => {
            // ✅ update lineId หลัง sign up สำเร็จ
            if (lineId) {
              try {
                await updateLineId(email, lineId);
              } catch (err) {
                console.error("Update lineId failed:", err);
              }
            }

            toast.success("Register success");
            router.push("/login");
          },
        }
      );
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error");
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" name="email" />
      </div>

      {/* Line ID */}
      <div className="space-y-2">
        <Label htmlFor="lineId">LINE ID (optional)</Label>
        <Input id="lineId" name="lineId" placeholder="LINE ID (ถ้ามี)" />
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input type="password" id="password" name="password" />
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input type="password" id="confirmPassword" name="confirmPassword" />
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registering...
          </>
        ) : (
          "Register"
        )}
      </Button>
    </form>
  );
};

export default RegisterForm;
