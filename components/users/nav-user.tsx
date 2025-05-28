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
import { ChevronDown, LogOut, ShieldUser, User } from "lucide-react";
import { useEffect, useState } from "react";

interface usertypes {
  user: {
    name: string;
    email: string;
    avatar: string;
    isAdmin?: boolean;
  };
  onSignOut?: () => void;
}

export function NavUserMain({ user, onSignOut }: usertypes) {
  // Add client-side only rendering to prevent hydration mismatch
  const [isClient, setIsClient] = useState(false);

  // This effect runs only on the client after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // If not yet on client, render a simplified version to avoid hydration mismatch
  if (!isClient) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className="relative flex items-center gap-1.5 rounded-full p-0 pl-0 pr-1 overflow-hidden"
          aria-label="User menu"
        >
          <Avatar className="h-8 w-8 ring-2 ring-background">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </div>
    );
  }

  // Full component rendered only on client
  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:flex flex-col items-end mr-2">
        <span className="truncate font-semibold text-sm">{user.name}</span>
        <span className="truncate text-xs text-muted-foreground/80">
          {user.email}
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative flex items-center gap-1.5 rounded-full p-0 pl-0 pr-1 overflow-hidden"
            aria-label="User menu"
          >
            <Avatar className="h-8 w-8 ring-2 ring-background">
              <AvatarImage src={user.avatar || undefined} alt={user.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-3 w-3 text-muted-foreground/70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-64 p-1.5 shadow-lg rounded-xl border border-border/30 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          align="end"
          forceMount
        >
          <div className="flex flex-col space-y-2 p-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                <AvatarImage src={user.avatar || undefined} alt={user.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-semibold leading-none">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground/80 mt-1">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
          <DropdownMenuSeparator className="my-1" />
          {user.isAdmin && (
            <DropdownMenuItem asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-xs font-medium rounded-lg h-9 px-2 hover:bg-secondary/60"
                onClick={() => (window.location.href = "/admin/dashboard")}
              >
                <ShieldUser className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                Admin Planel
              </Button>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Button
              variant="ghost"
              className="w-full justify-start text-xs font-medium rounded-lg h-9 px-2 hover:bg-secondary/60"
              onClick={() => (window.location.href = "/profile")}
            >
              <User className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              โปรไฟล์
            </Button>
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
}
