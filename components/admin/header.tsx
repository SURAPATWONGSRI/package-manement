import { DynamicBreadcrumb } from "@/components/admin/dynamic-breadcrumb";

import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AuthSession } from "@/types/auth";

interface AdminHeaderProps {
  session: AuthSession;
}

export function AdminHeader({ session }: AdminHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b">
      <div className="flex items-center gap-2 px-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <DynamicBreadcrumb />
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-4 px-4">
        {/* สามารถเพิ่ม user info หรือ action buttons ตรงนี้ได้ */}
        {session?.user && (
          <span className="text-xs text-muted-foreground">
            Hi, {session.user.username || session.user.name}
          </span>
        )}
      </div>
    </header>
  );
}
