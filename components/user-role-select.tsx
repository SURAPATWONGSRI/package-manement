"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { admin } from "@/lib/auth-client";
import { UserRole } from "@/lib/generated/prisma";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface UserRoleSelectProps {
  userId: string;
  role: UserRole;
}

export const UserRoleSelect = ({ userId, role }: UserRoleSelectProps) => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  async function handleValueChange(newRole: string) {
    const canChangeRole = await admin.hasPermission({
      permissions: {
        user: ["set-role"],
      },
    });

    if (canChangeRole.error) {
      return toast.error("Forbidden");
    }

    await admin.setRole({
      userId,
      role: newRole as UserRole,
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          toast.success("Role updated successfully");
          router.refresh();
        },
      },
    });
  }
  return (
    <Select
      value={role}
      onValueChange={handleValueChange}
      disabled={role === "ADMIN" || isPending}
    >
      <SelectTrigger className="w-[100px]">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ADMIN">ADMIN</SelectItem>
        <SelectItem value="USER">USER</SelectItem>
      </SelectContent>
    </Select>
  );
};
