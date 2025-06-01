"use client";

import { signUpEmailAction } from "@/actions/sign-up-email.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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

    // Validate username field
    const username = formData.get("username") as string;
    if (!username || username.trim() === "") {
      toast.error("กรุณากรอก Username");
      return;
    }

    // Username validation: only allow letters, numbers, and underscores
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      toast.error("Username ต้องประกอบด้วยตัวอักษร ตัวเลข หรือ _ เท่านั้น");
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
      console.log(
        "Submitting registration with name:",
        name,
        "username:",
        username
      );
      const { error, warning } = await signUpEmailAction(formData);

      if (error) {
        toast.error(error);
      } else {
        if (warning) {
          // Show warning toast but still consider it a success
          toast.warning(warning);
        }
        toast.success("ลงทะเบียนสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยัน");

        // เปลี่ยนเส้นทางให้ไปที่หน้า login พร้อม parameter แจ้งให้ยืนยันอีเมล
        router.push("/login?verification=required");
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
      <div className="space-y-2 ">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Enter Your Full Name"
          aria-required="true"
        />
      </div>

      {/* Username - New Field */}
      <div className="space-y-2 ">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          required
          placeholder="Enter Your Username"
          aria-required="true"
          pattern="^[a-zA-Z0-9_]+$"
          title="Username must contain only letters, numbers, and underscores"
        />
      </div>

      {/* Email */}
      <div className="space-y-2 ">
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          placeholder="Enter Your Email"
          id="email"
          name="email"
          required
        />
      </div>

      {/* Line ID */}
      <div className="space-y-2 ">
        <Label htmlFor="lineId">LINE ID</Label>
        <Input
          id="lineId"
          name="lineId"
          placeholder="Enter Your LINE ID"
          aria-description="Your LINE ID for communication purposes"
          minLength={4}
          maxLength={20}
          required
          pattern="^[a-z][a-z0-9._-]{3,19}$"
          title="LINE ID must be 4–20 characters, start with a letter, and contain only lowercase letters, numbers, dots, dashes, or underscores."
        />
      </div>

      {/* Password */}
      <div className="space-y-2 ">
        <Label htmlFor="password">Password</Label>
        <Input
          type="password"
          placeholder="Enter Your Password"
          id="password"
          name="password"
          required
        />
      </div>

      {/* Confirm Password */}
      <div className="space-y-2 ">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          type="password"
          placeholder="Enter Your Confirm Password"
          id="confirmPassword"
          name="confirmPassword"
          required
        />
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
