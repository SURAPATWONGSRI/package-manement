"use client";

import { updateUser } from "@/lib/auth-client";
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
  email: string; // เพิ่ม email เพื่อใช้กับ API update-line-id
}

export const UserUpdateForm = ({
  name,
  image,
  lineId,
  email,
}: UserUpdateFormProps) => {
  const [isPending, setIsPending] = React.useState(false);
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

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "กำลังอัพเดทข้อมูล..." : "อัพเดทข้อมูล"}
      </Button>
    </form>
  );
};
