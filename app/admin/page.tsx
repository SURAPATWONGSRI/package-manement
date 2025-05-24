import AdminLoginForm from "@/components/admin/login-form";
import { Printer } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบผู้ดูแลระบบ",
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Printer className="size-4" />
          </div>
          Back-Office.
        </a>
        <AdminLoginForm />
      </div>
    </div>
  );
}
