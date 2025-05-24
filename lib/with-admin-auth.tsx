import AccessDenied from "@/components/admin/access-denied";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// กำหนด type ให้ชัดเจนว่า session จะไม่เป็น null
export interface AdminPageProps {
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
}

export function withAdminAuth<T extends AdminPageProps>(
  Component: React.ComponentType<T>
) {
  async function AdminPageWithAuth(props: Omit<T, keyof AdminPageProps>) {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // ถ้าไม่มี session ให้ redirect ไปหน้า login
    if (!session) {
      redirect("/admin");
    }

    // ถ้าไม่ใช่ admin ให้แสดง AccessDenied component
    if (session.user.role !== "ADMIN") {
      return <AccessDenied />;
    }

    // ถ้าผ่านการตรวจสอบทั้งหมด ส่ง session ที่ไม่เป็น null ไปให้ Component
    return <Component {...(props as T)} session={session} />;
  }

  return AdminPageWithAuth;
}
