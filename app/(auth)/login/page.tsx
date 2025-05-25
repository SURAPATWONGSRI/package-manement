import LoginForm from "@/components/auth/login-form";
import { VerificationRequiredAlert } from "@/components/auth/verification-required-alert";
import { VerificationSuccessAlert } from "@/components/auth/verification-success-alert";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ",
};

interface PageProps {
  searchParams: Promise<{ verification?: string; error?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  // await searchParams เพื่อให้ได้ค่าจริงก่อนใช้งาน
  const params = await searchParams;
  const verification = params.verification;
  const error = params.error;

  return (
    <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-8">
        {/* <Link href="/" className="text-muted-foreground">
          {"<"} กลับไปที่หน้าแรก
        </Link> */}
        <h1 className="text-4xl font-bold">Login</h1>
      </div>

      {/* แสดง alert ตามสถานะ verification */}
      {verification === "success" && <VerificationSuccessAlert />}
      {verification === "required" && <VerificationRequiredAlert />}

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
          {error === "CredentialsSignin"
            ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
            : error}
        </div>
      )}

      <LoginForm />
      <p className="text-muted-foreground text-sm">
        Don&apos;t have an account?{" "}
        <Link href={"/register"} className="text-foreground hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
