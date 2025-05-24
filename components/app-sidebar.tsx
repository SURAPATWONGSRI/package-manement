"use client";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Printer, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { signOut, useSession } from "../lib/auth-client";
import { TeamSwitcher } from "./team-switcher";

type UserData = {
  name: string;
  email: string;
  avatar: string;
};

const navItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Users", href: "/admin/users", icon: Users },
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
      setUserData({
        name: session.user.name || "User",
        email: session.user.email || "",
        // แก้ไขตรงนี้: ใช้ image จาก session หรือใช้ค่าเริ่มต้น
        avatar: session.user.image || "",
      });
    }
  }, [session]);

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
          onSuccess: () => {
            toast.success("Sign out successfully");
            router.push("/admin");
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
