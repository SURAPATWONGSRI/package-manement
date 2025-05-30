"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PackageItem {
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
}

interface PackageSelection {
  id: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  name: string;
  email: string;
  packages: PackageItem[];
  payPrice: number;
  startDate: string;
  endDate: string;
  paid: boolean;
  stripeCustomerId?: string;
}

const PurchaseOrderPage = () => {
  const [packageSelections, setPackageSelections] = useState<
    PackageSelection[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackageSelections = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/package-selections", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setPackageSelections(data.data || []);
      } else {
        throw new Error(data.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching package selections:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการโหลดข้อมูล";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackageSelections();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: th });
    } catch {
      return "Invalid Date";
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy HH:mm", { locale: th });
    } catch {
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>กำลังโหลดข้อมูล...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-destructive">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-destructive">เกิดข้อผิดพลาด: {error}</p>
              <Button onClick={fetchPackageSelections} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                ลองใหม่
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-sans">Purchase Orders</h1>
          <p className="text-muted-foreground">คำสั่งซื้อและข้อมูลแพ็คเกจ</p>
        </div>
        <Button onClick={fetchPackageSelections} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          รีเฟรช
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            รายการคำสั่งซื้อ ({packageSelections.length} รายการ)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {packageSelections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">ไม่พบข้อมูลคำสั่งซื้อ</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead>แพ็คเกจ</TableHead>
                  <TableHead>ราคา</TableHead>
                  <TableHead>ระยะเวลา</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>วันที่สร้าง</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packageSelections.map((selection) => (
                  <TableRow key={selection.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{selection.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {selection.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {selection.packages.map((pkg, index) => (
                          <div key={index} className="flex gap-2">
                            <Badge variant="secondary">{pkg.symbol}</Badge>
                            <Badge variant="outline">{pkg.timeframe}</Badge>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        ฿{selection.payPrice.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(selection.startDate)}</div>
                        <div className="text-muted-foreground">
                          ถึง {formatDate(selection.endDate)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className="rounded-md"
                        variant={selection.paid ? "default" : "destructive"}
                      >
                        {selection.paid ? "ชำระแล้ว" : "ยังไม่ชำระ"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDateTime(selection.createdAt)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchaseOrderPage;
