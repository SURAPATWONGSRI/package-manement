"use client";

import { signOut, useSession } from "@/lib/auth-client";
import { Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NavUserMain } from "./nav-user";

type UserData = {
  name: string;
  email: string;
  avatar: string;
};
export function NavbarUser() {
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
    <nav className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl mx-auto">
        <Link
          href="/"
          className="flex items-center gap-3 font-semibold transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-2 py-1"
          aria-label="Package Management Homepage"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Package className="h-5 w-5" />
          </div>
          <span className="hidden md:inline-block text-lg font-semibold">
            Package Management
          </span>
        </Link>

        <div className="flex items-center">
          {session?.user && (
            <NavUserMain user={userData} onSignOut={handleSignOut} />
          )}
        </div>
      </div>
    </nav>
  );
}
