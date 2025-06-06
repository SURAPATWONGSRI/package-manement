"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Loader2, RefreshCw, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface PackageSelection {
  name: string;
  username: string;
  image: string | null;
  symbol: string;
  timeframe: string;
  payPrice: number;
  paid: string; // "YES" or "NO"
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
}

const PackagesPage = () => {
  const [packageSelections, setPackageSelections] = useState<
    PackageSelection[]
  >([]);
  const [filteredSelections, setFilteredSelections] = useState<
    PackageSelection[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [symbolFilter, setSymbolFilter] = useState<string>("all");

  // const getInitials = (name: string) =>
  //   name
  //     .split(" ")
  //     .map((word) => word.charAt(0))
  //     .join("")
  //     .toUpperCase()
  //     .slice(0, 2);

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
        const selections = Array.isArray(data.data) ? data.data : [];
        setPackageSelections(selections);
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

  // Filter function
  const filterSelections = useCallback(() => {
    if (!packageSelections || !Array.isArray(packageSelections)) {
      setFilteredSelections([]);
      return;
    }

    let filtered = packageSelections;

    if (searchTerm) {
      filtered = filtered.filter(
        (selection) =>
          selection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          selection.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((selection) => {
        if (statusFilter === "paid") return selection.paid === "YES";
        if (statusFilter === "unpaid") return selection.paid === "NO";
        return true;
      });
    }

    if (symbolFilter !== "all") {
      filtered = filtered.filter(
        (selection) => selection.symbol === symbolFilter
      );
    }

    setFilteredSelections(filtered);
  }, [packageSelections, searchTerm, statusFilter, symbolFilter]);

  const getUniqueSymbols = () => {
    const symbols = new Set<string>();
    if (packageSelections && Array.isArray(packageSelections)) {
      packageSelections.forEach((selection) => {
        symbols.add(selection.symbol);
      });
    }
    return Array.from(symbols).sort();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSymbolFilter("all");
  };

  const hasActiveFilters =
    searchTerm || statusFilter !== "all" || symbolFilter !== "all";

  useEffect(() => {
    fetchPackageSelections();
    document.title = "Purchase Orders - Admin Panel";
  }, []);

  useEffect(() => {
    filterSelections();
  }, [filterSelections]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: th });
    } catch {
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6  text-muted-foreground animate-spin" />
            <span className="text-muted-foreground">กำลังโหลด...</span>
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
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-1xl font-bold tracking-tight mb-1 sm:mb-2">
            Package
          </h1>
          <p className="text-muted-foreground">คำสั่งซื้อและข้อมูลแพ็คเกจ</p>
        </div>
        <Button onClick={fetchPackageSelections} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          รีเฟรช
        </Button>
      </div>

      {/* Minimal Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="relative min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาชื่อหรือ username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              <SelectItem value="paid">ชำระแล้ว</SelectItem>
              <SelectItem value="unpaid">ยกเลิกชำระ</SelectItem>
            </SelectContent>
          </Select>

          {/* Symbol Filter */}
          <Select value={symbolFilter} onValueChange={setSymbolFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="สัญลักษณ์" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ทั้งหมด</SelectItem>
              {!loading &&
                packageSelections &&
                getUniqueSymbols().map((symbol) => (
                  <SelectItem key={symbol} value={symbol}>
                    {symbol}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Clear Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="mr-1 h-4 w-4" />
              ล้าง
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>กรองโดย:</span>
            <div className="flex gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="px-2 py-1">
                  ค้นหา: &quot;{searchTerm}&quot;
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="px-2 py-1">
                  สถานะ: {statusFilter === "paid" ? "ชำระแล้ว" : "ยังไม่ชำระ"}
                </Badge>
              )}
              {symbolFilter !== "all" && (
                <Badge variant="secondary" className="px-2 py-1">
                  สัญลักษณ์: {symbolFilter}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {filteredSelections.length === 0 ? (
            <div className="text-center py-12">
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  {packageSelections.length === 0
                    ? "ไม่พบข้อมูลคำสั่งซื้อ"
                    : "ไม่พบข้อมูลที่ตรงกับการค้นหา"}
                </p>
                {hasActiveFilters && (
                  <Button
                    variant={"secondary"}
                    size={"sm"}
                    onClick={clearFilters}
                  >
                    ล้างตัวกรอง
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>PayPrice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSelections.map((selection, index) => (
                  <TableRow
                    key={`${selection.name}-${selection.username}-${index}`}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {/* <Avatar className="h-10 w-10">
                          <AvatarImage src={selection.image || undefined} />
                          <AvatarFallback className="text-xs font-medium">
                            {getInitials(selection.name)}
                          </AvatarFallback>
                        </Avatar> */}
                        <div>
                          <div className="font-semibold text-sm">
                            {selection.name || "N/A"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {selection.username || "N/A"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {selection.symbol || "N/A"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {selection.timeframe || "N/A"}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-emerald-500 ">
                        ฿{selection.payPrice.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <div>{formatDate(selection.startDate)}</div>
                        <div className="text-xs text-muted-foreground">
                          ถึง {formatDate(selection.endDate)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          selection.paid === "YES" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {selection.paid === "YES" ? "YES" : "NO"}
                      </Badge>
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

export default PackagesPage;
