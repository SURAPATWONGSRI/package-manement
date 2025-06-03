import { AdminHeader } from "@/components/admin/header";
import { AppSidebar } from "@/components/admin/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { headers } from "next/headers";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s | Admin Panel",
    default: "Admin Panel | Package Management",
  },
  description: "ระบบจัดการพัสดุสำหรับผู้ดูแลระบบ",
};

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Fetch session on server-side for admin components
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" session={session} />
      <SidebarInset>
        <AdminHeader session={session} />
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
