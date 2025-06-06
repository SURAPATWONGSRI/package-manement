"use client";

import { signOut } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { NavUserMain } from "./nav-user";

type Session = {
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    image?: string | null;
    role?: string;
  };
} | null;

type UserData = {
  name: string;
  email: string;
  username: string;
  avatar: string;
  isAdmin?: boolean;
};

interface NavbarUserProps {
  session: Session;
}

// Extract Logo component to prevent re-rendering when user state changes
const Logo = memo(function Logo() {
  return (
    <Link
      href="/main"
      className="flex items-center gap-3 font-semibold transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-2 py-1"
      aria-label="Package Management Homepage"
    >
      <span className="hidden md:inline-block text-lg font-semibold">
        Package
      </span>
    </Link>
  );
});

// Extract UserSkeleton to a separate component
const UserSkeleton = memo(function UserSkeleton() {
  return (
    <div className="h-8 w-8 rounded-full bg-secondary animate-pulse"></div>
  );
});

export const NavbarUser = memo(function NavbarUser({
  session,
}: NavbarUserProps) {
  const router = useRouter();

  // Transform session data directly without useState and useEffect
  const userData: UserData = useMemo(() => {
    if (!session?.user) {
      return { name: "", email: "", username: "", avatar: "" };
    }

    return {
      username: session.user.username || "",
      name: session.user.name || "User",
      email: session.user.email || "",
      avatar: session.user.image || "",
      isAdmin: session.user.role === "ADMIN",
    };
  }, [session]);

  // Memoize sign out handler to prevent recreation on each render
  const handleSignOut = useCallback(async () => {
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
  }, [router]);

  // Memoize the user component to avoid re-renders
  const userComponent = useMemo(() => {
    if (session?.user) {
      return <NavUserMain user={userData} onSignOut={handleSignOut} />;
    }
    return <UserSkeleton />;
  }, [session?.user, userData, handleSignOut]);

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
        <Logo />
        <div className="flex items-center">{userComponent}</div>
      </div>
    </nav>
  );
});
