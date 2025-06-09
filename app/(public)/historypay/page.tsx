"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserPackageHistory } from "@/hooks/use-user-package-history";
import { useSession } from "@/lib/auth-client";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  AlertCircle,
  Calendar,
  CreditCard,
  Package,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

function formatDate(dateString: string | null) {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return format(date, "dd MMM yyyy", { locale: th });
  } catch {
    return "N/A";
  }
}

function formatDateTime(dateString: string | null) {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return format(date, "dd MMM yyyy HH:mm", { locale: th });
  } catch {
    return "N/A";
  }
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function HistoryPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const {
    packageSelections,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    limit,
    refetch,
    goToPage,
    nextPage,
    prevPage,
  } = useUserPackageHistory(userId, { page: 1, limit: 10 });

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">ประวัติการซื้อ</h1>
            <p className="text-muted-foreground">ดูประวัติการซื้อทั้งหมด</p>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">ประวัติการซื้อ</h1>
            <p className="text-muted-foreground">ดูประวัติการซื้อทั้งหมด</p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            รีเฟรช
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            เกิดข้อผิดพลาดในการโหลดข้อมูล: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const paidPackages = packageSelections.filter((pkg) => pkg.paid === "YES");
  const unpaidPackages = packageSelections.filter((pkg) => pkg.paid === "NO");
  const totalAmount = paidPackages.reduce((sum, pkg) => sum + pkg.payPrice, 0);
  const averagePrice =
    paidPackages.length > 0 ? totalAmount / paidPackages.length : 0;

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">ประวัติการซื้อ</h1>
          <p className="text-muted-foreground">ดูประวัติการซื้อทั้งหมด</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          รีเฟรช
        </Button>
      </div>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ทั้งหมด</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">
              ชำระแล้ว {paidPackages.length} รายการ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยอดรวมที่ชำระ</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ฿{totalAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              จาก {paidPackages.length} รายการ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ราคาเฉลี่ย</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ฿{averagePrice.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ต่อรายการที่ชำระแล้ว
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รอการชำระ</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unpaidPackages.length}</div>
            <p className="text-xs text-muted-foreground">รายการที่ยังไม่ชำระ</p>
          </CardContent>
        </Card>
      </div>

      {/* Package History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            รายการประวัติการซื้อ
          </CardTitle>
        </CardHeader>
        <CardContent>
          {packageSelections.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">ไม่มีประวัติการซื้อ</h3>
              <p className="text-muted-foreground">
                คุณยังไม่เคยซื้อ เริ่มเลือกแพ็จเกจที่สนใจได้เลย
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>วัน เวลา ที่ซื้อ</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Symbol & Timeframe</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Start Date - End Date</TableHead>
                    <TableHead>Paid</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packageSelections.map((selection, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          {formatDateTime(selection.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 rounded-md">
                            <AvatarImage
                              src={selection.image || undefined}
                              alt={selection.username}
                            />
                            <AvatarFallback>
                              {selection.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium text-sm">
                            {selection.username}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{selection.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {selection.symbol}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {selection.timeframe}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">
                          ฿{selection.payPrice.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
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
            </div>
          )}

          {/* Pagination */}
          {packageSelections.length > 0 && totalPages > 1 && (
            <div className="mt-6 flex justify-end">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => prevPage()}
                      className={
                        currentPage <= 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => {
                      // Show first page, last page, current page, and pages around current page
                      const showPage =
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        Math.abs(pageNum - currentPage) <= 1;

                      if (!showPage) {
                        // Show ellipsis for gaps
                        if (pageNum === 2 && currentPage > 4) {
                          return (
                            <PaginationItem key={pageNum}>
                              <span className="flex h-9 w-9 items-center justify-center text-sm">
                                ...
                              </span>
                            </PaginationItem>
                          );
                        }
                        if (
                          pageNum === totalPages - 1 &&
                          currentPage < totalPages - 3
                        ) {
                          return (
                            <PaginationItem key={pageNum}>
                              <span className="flex h-9 w-9 items-center justify-center text-sm">
                                ...
                              </span>
                            </PaginationItem>
                          );
                        }
                        return null;
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => goToPage(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => nextPage()}
                      className={
                        currentPage >= totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              {/* Pagination info */}
              <div className="flex justify-center mt-4 text-xs text-muted-foreground">
                แสดง {(currentPage - 1) * limit + 1} -{" "}
                {Math.min(currentPage * limit, totalCount)} จาก {totalCount}{" "}
                รายการ
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
