import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UserHeader } from "@/components/users/header";
import { UserSidebar } from "@/components/users/sidebar/app-sidebar";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { headers } from "next/headers";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    template: "%s | Package Management",
    default: "Package Management | ระบบจัดการพัสดุ",
  },
  description: "ระบบจัดการพัสดุสำหรับผู้ใช้งาน",
};

interface PublicLayoutProps {
  children: ReactNode;
}

export default async function PublicLayout({ children }: PublicLayoutProps) {
  // Fetch session on server-side for user components
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <SidebarProvider>
      <UserSidebar variant="inset" session={session} />
      <SidebarInset>
        <UserHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
