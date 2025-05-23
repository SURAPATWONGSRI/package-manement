import LoginForm from "@/components/login-form";
import ReturnButton from "@/components/return-button";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ",
};
export default function page() {
  return (
    <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-8">
        <ReturnButton href="/" label="กลับไปที่หน้าแรก" />
        <h1 className="text-3xl font-semibold">Login</h1>
      </div>
      <LoginForm />
      <p className="text-muted-foreground text-sm">
        Don&apos;t have an account?{" "}
        <Link href={"/register"} className="hover:text-foreground">
          Register
        </Link>
      </p>
    </div>
  );
}
