"use client";

import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { Button } from "./ui/button";

export const GetStartedButton = () => {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <Button size="lg" className="opacity-50">
        Get Started
      </Button>
    );
  }

  const href = session ? "/profile" : "/login";
  return (
    <div className="flex flex-col gap-4 items-center">
      <Button size="lg" asChild>
        <Link href={href}>Get Started</Link>
      </Button>

      {session && (
        <p className="text-center">Welcome Back,{session.user.name}! 👋</p>
      )}
    </div>
  );
};
