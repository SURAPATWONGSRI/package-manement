"use client";

import { getSession, updateUser } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface UserUpdateFormProps {
  name: string;
  image: string;
  lineId: string | null;
  email: string;
}

export const UserUpdateForm = ({
  name,
  image,
  lineId,
  email,
}: UserUpdateFormProps) => {
  const [isPending, setIsPending] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const router = useRouter();

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setIsPending(true);

    try {
      const formData = new FormData(evt.target as HTMLFormElement);

      const newName = String(formData.get("name")).trim();
      const newImage = String(formData.get("image")).trim();
      const newLineId = String(formData.get("lineId")).trim();

      if (!newName && !newImage && !newLineId) {
        toast.error("กรุณากรอกชื่อ URL รูปภาพ หรือ Line ID");
        setIsPending(false);
        return;
      }

      let sessionNeedsRefresh = false;

      // อัพเดทชื่อและรูปภาพด้วย better-auth API
      if (newName || newImage) {
        await updateUser({
          ...(newName && { name: newName }),
          ...(newImage && { image: newImage }),
          fetchOptions: {
            onError: (ctx) => {
              toast.error(ctx.error.message);
            },
          },
        });

        sessionNeedsRefresh = true;
      }

      // อัพเดท lineId ด้วย API เฉพาะ ถ้ามีการเปลี่ยนแปลง
      if (newLineId !== (lineId || "")) {
        const lineIdResponse = await fetch("/api/update-line-id", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            lineId: newLineId || null,
          }),
        });

        const lineIdResult = await lineIdResponse.json();

        if (!lineIdResponse.ok) {
          throw new Error(lineIdResult.error || "Failed to update Line ID");
        }

        sessionNeedsRefresh = true;
      }

      // Refresh session if needed
      if (sessionNeedsRefresh) {
        setIsRefreshing(true);
        toast.info("กำลังอัพเดทข้อมูลผู้ใช้...");

        // Refresh session
        await getSession({
          query: {
            disableCookieCache: true,
            disableRefresh: false,
          },
        });

        setIsRefreshing(false);
      }

      toast.success("ข้อมูลผู้ใช้อัพเดทเรียบร้อยแล้ว");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการอัพเดทข้อมูล"
      );
    } finally {
      setIsPending(false);
    }
  }
  return (
    <form className="max-w-sm w-full space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">ชื่อ</Label>
        <Input id="name" name="name" defaultValue={name} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="image">URL รูปภาพ</Label>
        <Input
          id="image"
          name="image"
          defaultValue={image || ""}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="lineId">Line ID</Label>
        <Input
          id="lineId"
          name="lineId"
          defaultValue={lineId || ""}
          placeholder="กรอก Line ID ของคุณ"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending || isRefreshing}
        className="w-full"
      >
        {isPending
          ? "กำลังอัพเดทข้อมูล..."
          : isRefreshing
          ? "กำลังรีเฟรชข้อมูล..."
          : "อัพเดทข้อมูล"}
      </Button>
    </form>
  );
};
