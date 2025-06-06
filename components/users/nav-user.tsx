"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, Settings, ShieldUser } from "lucide-react";
import Link from "next/link";
import { memo } from "react";

interface UserProfile {
  name: string;
  email: string;
  username: string;
  avatar: string;
  isAdmin?: boolean;
}

interface NavUserProps {
  user: UserProfile;
  onSignOut?: () => void;
}

// Memoized component to render user avatar consistently
const UserAvatar = memo(
  ({
    user,
    className = "h-8 w-8",
    showRing = true,
  }: {
    user: UserProfile;
    className?: string;
    showRing?: boolean;
  }) => {
    const userInitial = user.name.charAt(0).toUpperCase();
    const ringClass = showRing ? "ring-2 ring-background" : "";

    return (
      <Avatar className={`${className} ${ringClass}`}>
        <AvatarImage
          src={user.avatar || undefined}
          alt={`${user.name}'s avatar`}
        />
        <AvatarFallback className="bg-primary/10 font-sans text-primary font-medium">
          {userInitial}
        </AvatarFallback>
      </Avatar>
    );
  }
);

UserAvatar.displayName = "UserAvatar";

export const NavUserMain = memo(({ user, onSignOut }: NavUserProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:flex flex-col items-end mr-2">
        <span className="truncate font-medium font-sans text-sm">
          {user.name}
        </span>
        <span className="truncate text-xs font-sans text-muted-foreground/80">
          {user.username}
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative flex items-center gap-1.5 rounded-full p-0 pl-0 pr-1 overflow-hidden"
            aria-label="User menu"
          >
            <UserAvatar user={user} />
            <ChevronDown className="h-3 w-3 text-muted-foreground/70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-64 p-1.5 shadow-lg rounded-xl border border-border/30 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          align="end"
        >
          <div className="flex flex-col space-y-2 p-2">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} className="h-10 w-10" showRing={false} />
              <div className="flex flex-col">
                <p className="text-sm font-medium font-sans leading-none">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  {user.username}
                </p>
              </div>
            </div>
          </div>
          <DropdownMenuSeparator className="my-1" />
          {user.isAdmin && (
            <DropdownMenuItem asChild>
              <Link
                href="/admin/dashboard"
                className="w-full flex items-center text-xs font-medium rounded-lg h-9 px-2 hover:bg-secondary/60"
              >
                <ShieldUser className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                <p className="font-sans">Admin Planel</p>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link
              href="/setting"
              className="w-full flex items-center text-xs font-medium rounded-lg h-9 px-2 hover:bg-secondary/60"
            >
              <Settings className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              ตั้งค่า
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-xs font-medium rounded-lg h-9 px-2 text-destructive/90 hover:text-destructive hover:bg-destructive/10"
              onClick={onSignOut}
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              ออกจากระบบ
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

NavUserMain.displayName = "NavUserMain";
