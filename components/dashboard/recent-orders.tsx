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
        <div className="space-y-4">
          {displayedOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between space-x-4"
            >
              <div className="flex items-center space-x-4">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={order.user.image} />
                  <AvatarFallback className="text-xs">
                    {getInitials(order.user.name || order.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {order.user.name || order.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {order.user.email || order.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  className="rounded-md"
                  variant={order.paid ? "default" : "secondary"}
                >
                  {order.paid ? "ชำระแล้ว" : "รอชำระ"}
                </Badge>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatPrice(order.payPrice)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              ไม่มีคำสั่งซื้อ
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const RecentOrders = memo(RecentOrdersComponent);
