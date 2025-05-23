"use client";
import { signIn } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface LoginFormProps {
  redirectUrl?: string;
  onSuccess?: () => void;
}

const AdminLoginForm = ({
  redirectUrl = "/admin/dashboard",
  onSuccess,
}: LoginFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.target as HTMLFormElement);

    const email = String(formData.get("email"));
    if (!email) return toast.error("กรุณากรอกอีเมล");

    const password = String(formData.get("password"));
    if (!password) return toast.error("กรุณากรอกรหัสผ่าน");

    setIsLoading(true);

    try {
      await signIn.email(
        {
          email,
          password,
        },
        {
          onError: (ctx) => {
            toast.error(
              ctx.error.message || "เข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง"
            );
          },
          onSuccess: () => {
            toast.success("เข้าสู่ระบบสำเร็จ");

            if (onSuccess) {
              onSuccess();
            } else {
              router.push(redirectUrl);
              router.refresh();
            }
          },
        }
      );
    } catch (error) {
      console.error("Login error:", error);
      toast.error("เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
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
          disabled={isLoading}
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
          disabled={isLoading}
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
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
