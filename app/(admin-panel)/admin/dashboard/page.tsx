import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { withAdminAuth, type AdminPageProps } from "@/lib/with-admin-auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
};

function AdminDashboardPage({ session }: AdminPageProps) {
  return (
    <div className="space-y-6 md:space-y-8 w-full">
      <div>
        <h1 className="text-2xl sm:text-1xl font-bold tracking-tight mb-1 sm:mb-2">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome 👋, {session?.user?.username || "Administrator"}.
        </p>
      </div>

      <DashboardOverview />
    </div>
  );
}

export default withAdminAuth(AdminDashboardPage);
