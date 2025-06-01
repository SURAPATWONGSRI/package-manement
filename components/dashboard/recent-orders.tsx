import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { memo, useMemo } from "react";

interface PackageSelection {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  payPrice: number;
  paid: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

interface RecentOrdersProps {
  orders: PackageSelection[];
}

const RecentOrdersComponent = ({ orders }: RecentOrdersProps) => {
  // Memoize expensive calculations
  const formatPrice = useMemo(
    () => (price: number) =>
      new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
      }).format(price),
    []
  );

  const formatDate = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Bangkok",
    });

    return (dateString: string) => {
      try {
        return formatter.format(new Date(dateString));
      } catch {
        return "Invalid Date";
      }
    };
  }, []);

  const getInitials = useMemo(
    () => (name: string) =>
      name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2),
    []
  );

  // Memoize the displayed orders
  const displayedOrders = useMemo(() => orders.slice(0, 5), [orders]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>คำสั่งซื้อล่าสุด</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">ไม่มีคำสั่งซื้อ</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-card transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={order.user.image} />
                    <AvatarFallback className="text-xs font-medium">
                      {getInitials(order.user.name || order.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {order.user.name || order.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {order.user.email || order.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {formatPrice(order.payPrice)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={order.paid ? "default" : "secondary"}
                    className="shrink-0"
                  >
                    {order.paid ? "ชำระแล้ว" : "ยกเลิกชำระ"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const RecentOrders = memo(RecentOrdersComponent);
