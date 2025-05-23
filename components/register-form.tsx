"use client";
import { signUp } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type SignUpParams = {
  name: string;
  email: string;
  password: string;
  lineId?: string;
};

const RegisterForm = () => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  // Handle form submit
  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.target as HTMLFormElement);

    const name = String(formData.get("name"));
    if (!name) return toast.error("Please enter your name");

    const password = String(formData.get("password"));
    if (!password) return toast.error("Please enter your password");

    const email = String(formData.get("email"));
    if (!email) return toast.error("Please enter your email");

    // ยังคงเก็บค่า lineId ไว้ แต่ไม่ส่งไปกับ signUp.email
    const lineId = String(formData.get("lineId") || "");

    try {
      await signUp.email(
        {
          name,
          email,
          password,
          lineId: lineId || undefined,
        } as SignUpParams,
        {
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
            toast.success("Register successfully");
            router.push("/login");
          },
        }
      );
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An unexpected error occurred");
      setIsPending(false); // ตั้งค่า isPending เป็น false ในกรณีเกิดข้อผิดพลาด
    }
  }
  return (
    <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" name="email" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="lineId">LINE ID (ไม่บังคับ)</Label>
        <Input
          id="lineId"
          name="lineId"
          placeholder="กรอก LINE ID ของคุณ (ถ้ามี)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input type="password" id="password" name="password" />
      </div>

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
