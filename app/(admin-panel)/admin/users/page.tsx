import {
  DeleteUserButton,
  PlaceholderDeleteUserButton,
} from "@/components/delete-user-button";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRoleSelect } from "@/components/user-role-select";
import { auth } from "@/lib/auth";
import { UserRole } from "@/lib/generated/prisma";
import { prisma } from "@/lib/prisma";
import { withAdminAuth, type AdminPageProps } from "@/lib/with-admin-auth";
import { Edit, Loader2 } from "lucide-react";
import { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Users ",
};

// Component สำหรับแสดงข้อความกำลังโหลด
function LoadingState() {
  return (
    <div className="h-40 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
      <span className="text-muted-foreground">กำลังโหลด...</span>
    </div>
  );
}

// Component สำหรับแสดงตารางข้อมูลผู้ใช้
async function UsersTable() {
  const headerList = await headers();

  // ดึงข้อมูลผู้ใช้จาก better-auth
  const { users: authUsers } = await auth.api.listUsers({
    headers: headerList,
    query: {
      sortBy: "name",
    },
  });

  // ดึงข้อมูล lineId จาก Prisma
  const userIds = authUsers.map((user) => user.id);
  const dbUsers = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, lineId: true },
  });

  // รวมข้อมูล
  const userLineIds = Object.fromEntries(
    dbUsers.map((user) => [user.id, user.lineId])
  );

  // เพิ่ม lineId เข้าไปในข้อมูลผู้ใช้
  const users = authUsers.map((user) => ({
    ...user,
    lineId: userLineIds[user.id] || null,
  }));

  return (
    <div className="w-full rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Line_Id</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                ไม่พบข้อมูลผู้ใช้
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium text-xs">
                  {user.id.slice(0, 8)}
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.lineId || "-"}</TableCell>
                <TableCell>
                  <UserRoleSelect
                    userId={user.id}
                    role={user.role as UserRole}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {user.role === "USER" ? (
                      <DeleteUserButton userId={user.id} />
                    ) : (
                      <PlaceholderDeleteUserButton />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// หน้า Users
// ใช้ Suspense เพื่อแสดง LoadingState ขณะรอข้อมูล
async function AdminUserPage({}: AdminPageProps) {
  return (
    <div className="space-y-6 md:space-y-8 w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 sm:mb-2">
          Users
        </h1>
        <p className="text-muted-foreground">จัดการข้อมูลผู้ใช้ทั้งหมดในระบบ</p>
      </div>

      {/* Suspense จะแสดง LoadingState ในขณะที่รอ UsersTable โหลดข้อมูลเสร็จ */}
      <Suspense fallback={<LoadingState />}>
        <UsersTable />
      </Suspense>
    </div>
  );
}

export default withAdminAuth(AdminUserPage);
