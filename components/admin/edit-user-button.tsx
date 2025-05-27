"use client";

import { updateUserAction } from "@/actions/update-user.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface EditUserButtonProps {
  userId: string;
  userName: string;
  userEmail: string;
  userLineId: string | null;
  userImage?: string | null;
}

export const EditUserButton = ({
  userId,
  userName,
  userEmail,
  userLineId,
  userImage,
}: EditUserButtonProps) => {
  const [isPending, setIsPending] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(userName);
  const [email, setEmail] = React.useState(userEmail);
  const [lineId, setLineId] = React.useState(userLineId || "");
  const [image, setImage] = React.useState(userImage || "");

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
      setName(userName);
      setEmail(userEmail);
      setLineId(userLineId || "");
      setImage(userImage || "");
    }
  }, [open, userName, userEmail, userLineId, userImage]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setIsPending(true);
      const formattedLineId = lineId.trim() === "" ? null : lineId.trim();

      const result = await updateUserAction({
        userId,
        name: name.trim(),
        email: email.trim(),
        lineId: formattedLineId,
        image: image.trim() || null,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("อัปเดตข้อมูลผู้ใช้สำเร็จ");
        setOpen(false);
      }
    } catch (error) {
      console.error("Failed to update user:", error);
      toast.error("ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit User</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูล</DialogTitle>
          <DialogDescription>
            แก้ไขข้อมูลของผู้ใช้ <span className="font-medium">{userName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อ</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lineId">LINE ID</Label>
            <Input
              id="lineId"
              value={lineId}
              onChange={(e) => setLineId(e.target.value)}
              placeholder="ไม่ระบุ"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">รูปโปรไฟล์ (URL)</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/profile.jpg"
                className="flex-1"
              />
              <Avatar className="h-10 w-10 border rounded-lg">
                <AvatarImage src={image || undefined} alt={name} />
                <AvatarFallback className="rounded-lg">
                  {name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <p className="text-xs text-muted-foreground">
              ใส่ URL ของรูปภาพที่ต้องการใช้เป็นรูปโปรไฟล์
            </p>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "กำลังบันทึก..." : "บันทึก"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
