"use client";
import { signInEmailAction } from "@/actions/sign-in-email";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const AdminLoginForm = () => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  // Handle form submit
  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.target as HTMLFormElement);

    setIsPending(true);

    const { error } = await signInEmailAction(formData);

    setIsPending(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Login successful");
      router.push("/admin/dashboard");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">อีเมล</Label>
        <Input
          type="email"
          id="email"
          name="email"
          placeholder="กรอกอีเมลของคุณ"
          required
          disabled={isPending}
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">รหัสผ่าน</Label>
          <a
            href="/reset-password"
            className="text-xs text-primary hover:underline"
          >
            ลืมรหัสผ่าน?
          </a>
        </div>
        <Input
          type="password"
          id="password"
          name="password"
          placeholder="กรอกรหัสผ่านของคุณ"
          required
          disabled={isPending}
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            กำลังเข้าสู่ระบบ...
          </>
        ) : (
          "เข้าสู่ระบบ"
        )}
      </Button>
    </form>
  );
};

export default AdminLoginForm;
