"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ChevronsUpDown, House, LogOut, Settings } from "lucide-react";
import Link from "next/link";

// Define proper types for component props
interface UserProfile {
  name?: string;
  email?: string;
  avatar?: string;
}

interface NavUserProps {
  user: UserProfile;
  onSignOut?: () => void;
}

// Component to render user avatar consistently
const UserAvatar = ({
  user,
  className = "h-8 w-8 rounded-lg",
}: {
  user: UserProfile;
  className?: string;
}) => {
  const userInitial = user.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <Avatar className={className}>
      <AvatarImage
        src={user.avatar || undefined}
        alt={`${user.name || "User"}'s avatar`}
      />
      <AvatarFallback className="rounded-lg bg-zinc-100">
        {userInitial}
      </AvatarFallback>
    </Avatar>
  );
};

export function NavUser({ user, onSignOut }: NavUserProps) {
  const { isMobile } = useSidebar();

  // Navigation menu items
  const menuItems = [
    {
      href: "/main",
      icon: <House className="mr-2 size-4" aria-hidden="true" />,
      label: "Back To Main Page",
    },
    {
      href: "/admin/setting",
      icon: <Settings className="mr-2 size-4" aria-hidden="true" />,
      label: "Setting",
    },
  ];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              aria-label="User menu"
            >
              <UserAvatar user={user} />
              <div className="flex flex-col gap-0.5 overflow-hidden text-left">
                <span className="truncate font-medium font-sans text-sm">
                  {user.name || "User"}
                </span>
                <span className="truncate text-xs font-sans text-muted-foreground">
                  {user.email || "No email"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" aria-hidden="true" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="px-2 py-1.5 flex items-center gap-2">
                <UserAvatar user={user} />
                <div>
                  <div className="text-sm font-sans font-medium">
                    {user.name || "User"}
                  </div>
                  <div className="text-xs font-sans font-medium text-muted-foreground truncate">
                    {user.email || "No email"}
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {menuItems.map((item, index) => (
              <DropdownMenuItem asChild key={index}>
                <Link
                  href={item.href}
                  className="flex items-center  cursor-pointer"
                >
                  {item.icon}
                  <span className="text-sm font-sans ">{item.label}</span>
                </Link>
              </DropdownMenuItem>
            ))}

            <DropdownMenuItem
              onClick={onSignOut}
              className="text-destructive"
              aria-label="Log out"
            >
              <LogOut className="mr-2 size-4" aria-hidden="true" />
              <span className="text-sm font-sans">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
