"use client";

import { NavMain } from "@/components/admin/sidebar/nav-main";
import { NavUser } from "@/components/admin/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { signOut, useSession } from "@/lib/auth-client";
import { LayoutDashboard, Printer, ReceiptText, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TeamSwitcher } from "./team-switcher";

type UserData = {
  name: string;
  email: string;
  avatar: string;
};

const navItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Purchase Order", href: "/admin/purchase-order", icon: ReceiptText },
];
// This is sample data.
const data = {
  teams: [
    {
      name: "Back Office",
      logo: Printer,
      plan: "Enterprise",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const { data: session } = useSession();

  // สร้าง state เพื่อเก็บข้อมูลผู้ใช้
  const [userData, setUserData] = useState<UserData>({
    name: "Loading...",
    email: "",
    avatar: "",
  });

  // อัพเดตข้อมูลผู้ใช้เมื่อ session เปลี่ยนแปลง
  useEffect(() => {
    if (session?.user) {
      // Check if user is verified and has admin role
      if (!session.user.emailVerified) {
        toast.error("Account not verified. Logging out...");
        handleSignOut();
        return;
      }

      if (session.user.role !== "ADMIN") {
        toast.error("Access denied. Admin privileges required.");
        router.push("/main");
        return;
      }

      setUserData({
        name: session.user.name || "User",
        email: session.user.email || "",
        avatar: session.user.image || "",
      });
    } else {
      // No session, redirect to admin login
      router.push("/admin");
    }
  }, [session, router]);

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
          onSuccess: () => {
            toast.success("Sign out successfully");
            router.push("/login");
          },
        },
      });
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={navItems.map(({ href, ...rest }) => ({
            url: href,
            ...rest,
          }))}
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} onSignOut={handleSignOut} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
