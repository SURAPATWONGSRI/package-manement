"use client";

import { changePasswordAction } from "@/actions/change-password.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import { toast } from "sonner";

export const ChangePasswordForm = () => {
  const [isPending, setIsPending] = React.useState(false);

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setIsPending(true);
    const formData = new FormData(evt.target as HTMLFormElement);

    const { error } = await changePasswordAction(formData);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Password changed successfully");
      (evt.target as HTMLFormElement).reset();
    }

    setIsPending(false);
  }
  return (
    <form className="max-w-sm w-full space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="currentPassword">รหัสผ่านปัจจุบัน</Label>
        <Input
          type="password"
          placeholder="*********"
          id="currentPassword"
          name="currentPassword"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="newPassword">รหัสผ่านใหม่</Label>
        <Input
          type="password"
          placeholder="*********"
          id="newPassword"
          name="newPassword"
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        เปลี่ยนรหัสผ่าน
      </Button>
    </form>
  );
};
