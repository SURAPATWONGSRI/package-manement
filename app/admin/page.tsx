import AdminLoginForm from "@/components/admin/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบผู้ดูแลระบบ",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-svh flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* หัวข้อ */}

        {/* การ์ดแบบฟอร์ม */}
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">Admin Planel</h1>
            <p className="text-sm text-muted-foreground">
              เข้าสู่ระบบเพื่อจัดการระบบ
            </p>
          </div>

          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
