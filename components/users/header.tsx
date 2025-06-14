"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export function UserHeader() {
  const pathname = usePathname();

  // สร้างชื่อหน้าจากพาธปัจจุบัน
  const getPageTitle = () => {
    const path = pathname.split("/").filter(Boolean);
    if (path.length === 0) return "หน้าหลัก";

    const lastSegment = path[path.length - 1];
    // แปลง kebab-case หรือ snake_case เป็นคำที่อ่านได้
    const formattedSegment = lastSegment
      .replace(/-|_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    return formattedSegment;
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3 px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <div className="text-lg font-medium tracking-tight hidden sm:block">
          {getPageTitle()}
        </div>
      </div>
    </header>
  );
}
