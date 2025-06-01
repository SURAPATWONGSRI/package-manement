"use client";

import { NavMain } from "@/components/admin/sidebar/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { signOut, useSession } from "@/lib/auth-client";
import { LayoutDashboard, Printer, ReceiptText, Users } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { TeamSwitcher } from "./team-switcher";

// Server-safe loading component for NavUser
const NavUserSkeleton = () => (
  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
    <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
    <div className="grid flex-1 text-left text-sm leading-tight">
      <div className="h-4 w-16 bg-muted rounded animate-pulse" />
      <div className="h-3 w-24 bg-muted rounded animate-pulse mt-1" />
    </div>
    <div className="h-4 w-4 bg-muted rounded animate-pulse ml-auto" />
  </div>
);

// Dynamically import NavUser to prevent hydration mismatch
const DynamicNavUser = dynamic(
  () =>
    import("@/components/admin/sidebar/nav-user").then((mod) => ({
      default: mod.NavUser,
    })),
  {
    ssr: false,
    loading: () => <NavUserSkeleton />,
  }
);

type UserData = {
  name?: string;
  email?: string;
  avatar?: string;
};

const navItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Users", href: "/admin/users", icon: Users },
  { title: "Purchase Order", href: "/admin/purchase-order", icon: ReceiptText },
];

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

  const userData: UserData = {
    name: session?.user?.name || "User",
    email: session?.user?.email || "",
    avatar: session?.user?.image || "",
  };

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
        {session?.user ? (
          <DynamicNavUser user={userData} onSignOut={handleSignOut} />
        ) : (
          <NavUserSkeleton />
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
