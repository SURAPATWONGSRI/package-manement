"use client";

import { signOut, useSession } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { NavUserMain } from "./nav-user";

type UserData = {
  name: string;
  email: string;
  avatar: string;
  isAdmin?: boolean;
};

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
    <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse"></div>
  );
});

export const NavbarUser = memo(function NavbarUser() {
  const router = useRouter();
  const { data: session } = useSession();

  // Use client-side rendering for user data to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: "",
    email: "",
    avatar: "",
  });

  // Mount effect - runs only once
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update user data effect - only runs when session changes
  useEffect(() => {
    if (session?.user) {
      setUserData({
        name: session.user.name || "User",
        email: session.user.email || "",
        avatar: session.user.image || "",
        isAdmin: session.user.role === "ADMIN" || false,
      });
    }
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
    if (mounted && session?.user) {
      return <NavUserMain user={userData} onSignOut={handleSignOut} />;
    }
    return <UserSkeleton />;
  }, [mounted, session?.user, userData, handleSignOut]);

  return (
    <nav className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
        <Logo />
        <div className="flex items-center">{userComponent}</div>
      </div>
    </nav>
  );
});
