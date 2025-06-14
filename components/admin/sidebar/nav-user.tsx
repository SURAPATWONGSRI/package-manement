"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { ChevronDown, Home, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";

// Define proper types for component props
interface UserProfile {
  name?: string;
  email?: string;
  avatar?: string;
  username?: string;
  role?: string;
}

interface NavUserProps {
  user: UserProfile;
  onSignOut?: () => void;
}

// Component to render user avatar consistently
const UserAvatar = ({
  user,
  className = "h-9 w-9 border-2 border-primary/10",
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
      <AvatarFallback className="bg-primary/10 text-primary font-medium">
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
      icon: <Home className="mr-2 size-4" aria-hidden="true" />,
      label: "Main Dashboard",
    },
    {
      href: "/admin/profile",
      icon: <User className="mr-2 size-4" aria-hidden="true" />,
      label: "My Profile",
    },
    {
      href: "/admin/setting",
      icon: <Settings className="mr-2 size-4" aria-hidden="true" />,
      label: "Settings",
    },
  ];

  return (
    <SidebarMenu>
      <SidebarMenuItem className="px-2 py-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="w-full p-2 rounded-xl transition-all hover:bg-accent group relative
                         data-[state=open]:bg-accent"
              aria-label="User menu"
            >
              <div className="flex items-center gap-3">
                <UserAvatar user={user} />
                <div className="flex flex-col gap-0.5 overflow-hidden text-left">
                  <span className="truncate font-medium text-sm group-hover:text-primary">
                    {user.name || "User"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="truncate text-xs text-muted-foreground">
                      {user.username || "No username"}
                    </span>
                    {user.role && (
                      <Badge
                        variant="outline"
                        className="text-[10px] py-0 px-1.5 h-4"
                      >
                        {user.role}
                      </Badge>
                    )}
                  </div>
                </div>
                <ChevronDown
                  className="ml-auto size-4 opacity-70"
                  aria-hidden="true"
                />
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="p-3 flex items-center gap-3 bg-accent/40 rounded-t-lg">
                <UserAvatar user={user} className="h-10 w-10" />
                <div>
                  <div className="text-sm font-medium">
                    {user.name || "User"}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {user.username || "No username"}
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            <div className="p-2 space-y-1">
              {menuItems.map((item, index) => (
                <DropdownMenuItem
                  asChild
                  key={index}
                  className="rounded-lg py-2"
                >
                  <Link
                    href={item.href}
                    className="flex items-center cursor-pointer"
                  >
                    {item.icon}
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator className="my-1" />

              <DropdownMenuItem
                onClick={onSignOut}
                className="text-destructive rounded-lg py-2"
                aria-label="Log out"
              >
                <LogOut className="mr-2 size-4" aria-hidden="true" />
                <span className="text-sm">Log out</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
