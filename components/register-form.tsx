"use client";

import { signUpEmailAction } from "@/actions/sign-up-email.action";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const RegisterForm = () => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.target as HTMLFormElement);

    // Validate name field
    const name = formData.get("name") as string;
    if (!name || name.trim() === "") {
      toast.error("กรุณากรอกชื่อ");
      return;
    }

    // Validate lineId if provided
    const lineId = formData.get("lineId") as string;
    if (lineId && lineId.trim() !== "") {
      // LINE ID should not contain spaces
      if (lineId.includes(" ")) {
        toast.error("LINE ID ไม่ควรมีช่องว่าง");
        return;
      }

      // LINE ID should be at least 3 characters
      if (lineId.trim().length < 3) {
        toast.error("LINE ID ควรมีความยาวอย่างน้อย 3 ตัวอักษร");
        return;
      }
    }

    setIsPending(true);

    try {
      console.log("Submitting registration with name:", name);
      const { error, warning } = await signUpEmailAction(formData);

      if (error) {
        toast.error(error);
      } else {
        if (warning) {
          // Show warning toast but still consider it a success
          toast.warning(warning);
        }
        toast.success("ลงทะเบียนเรียบร้อย กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน");

        router.push("/login");
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error("เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Your full name"
          aria-required="true"
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" name="email" />
      </div>

      {/* Line ID */}
      <div className="space-y-2">
        <Label htmlFor="lineId">LINE ID (optional)</Label>
        <Input
          id="lineId"
          name="lineId"
          placeholder="LINE ID (ถ้ามี)"
          aria-description="Your LINE ID for communication purposes"
          minLength={3}
          pattern="[^\s]+"
          title="LINE ID should not contain spaces"
        />
        <p className="text-xs text-gray-500">
          LINE ID จะใช้สำหรับการติดต่อกับคุณ (ไม่จำเป็นต้องกรอก)
        </p>
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
