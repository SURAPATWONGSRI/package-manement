import LoginForm from "@/components/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ",
};
export default function page() {
  return (
    <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-8">
        <h1 className="text-3xl font-semibold">Login</h1>
      </div>
      <LoginForm />
    </div>
  );
}
