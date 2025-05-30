"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePackageSelections } from "@/hooks/use-package-selections";
import {
  AlertCircle,
  CreditCard,
  Package,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import { RecentOrders } from "./recent-orders";
import { StatsCard } from "./stats-card";

export function DashboardOverview() {
  const { data, loading, error, refetch } = usePackageSelections();

  const calculateStats = () => {
    if (!data || data.length === 0) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        paidOrders: 0,
        uniqueUsers: 0,
        paidRate: 0,
      };
    }

    const totalOrders = data.length;
    const totalRevenue = data.reduce((sum, order) => sum + order.payPrice, 0);
    const paidOrders = data.filter((order) => order.paid).length;
    const uniqueUsers = new Set(data.map((order) => order.userId)).size;
    const paidRate = totalOrders > 0 ? (paidOrders / totalOrders) * 100 : 0;

    return {
      totalOrders,
      totalRevenue,
      paidOrders,
      uniqueUsers,
      paidRate,
    };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
    }).format(price);
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            ลองใหม่
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))
        ) : (
          <>
            <StatsCard
              title="คำสั่งซื้อทั้งหมด"
              value={stats.totalOrders.toLocaleString()}
              description="จำนวนคำสั่งซื้อทั้งหมด"
              icon={Package}
            />
            <StatsCard
              title="รายได้ทั้งหมด"
              value={formatPrice(stats.totalRevenue)}
              description="รายได้รวมทั้งหมด"
              icon={CreditCard}
            />
            <StatsCard
              title="ผู้ใช้งาน"
              value={stats.uniqueUsers.toLocaleString()}
              description="จำนวนผู้ใช้งาน"
              icon={Users}
            />
            <StatsCard
              title="อัตราการชำระเงิน"
              value={`${stats.paidRate.toFixed(1)}%`}
              description={`${stats.paidOrders} จาก ${stats.totalOrders} คำสั่งซื้อ`}
              icon={TrendingUp}
            />
          </>
        )}
      </div>

      {/* Recent Orders */}
      <div className="grid gap-4 md:grid-cols-1">
        {loading ? (
          <Skeleton className="h-96" />
        ) : (
          <RecentOrders orders={data} />
        )}
      </div>
    </div>
  );
}
