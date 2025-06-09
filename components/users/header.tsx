"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { signOut } from "@/lib/auth-client";
import { AuthSession } from "@/types/auth";
import { NavUserMain } from "./nav-user";

interface UserHeaderProps {
  session: AuthSession;
}

export function UserHeader({ session }: UserHeaderProps) {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b">
      <div className="flex items-center gap-2 px-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
      </div>
      <div className="flex items-center gap-4 px-4">
        {session?.user && (
          <NavUserMain
            user={{
              name: session.user.name || "",
              email: session.user.email || "",
              username: session.user.username || "",
              avatar: session.user.image || "",
              isAdmin: session.user.role === "ADMIN",
            }}
            onSignOut={handleSignOut}
          />
        )}
      </div>
    </header>
  );
}
