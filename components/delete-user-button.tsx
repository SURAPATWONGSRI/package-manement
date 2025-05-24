"use client";
import { deleteUserAction } from "@/actions/delete-user.action";
import { TrashIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface DeleteUserButtonProps {
  userId: string;
  userName?: string;
}

export const DeleteUserButton = ({
  userId,
  userName = "ผู้ใช้นี้",
}: DeleteUserButtonProps) => {
  const [isPending, setIsPending] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  async function handleDelete() {
    try {
      setIsPending(true);
      const { error } = await deleteUserAction({ userId });

      if (error) {
        toast.error(error);
      } else {
        toast.success("ลบผู้ใช้สำเร็จ");
        setOpen(false);
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("ไม่สามารถลบผู้ใช้ได้");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
        >
          <TrashIcon className="h-4 w-4" />
          <span className="sr-only">Delete User</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ยืนยันการลบผู้ใช้</DialogTitle>
          <DialogDescription>
            คุณกำลังจะลบบัญชีผู้ใช้{" "}
            <span className="font-medium">{userName}</span> ออกจากระบบ
            การกระทำนี้ไม่สามารถเรียกคืนได้
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 mt-2">
          <p>
            เมื่อลบบัญชีผู้ใช้แล้ว
            ข้อมูลที่เกี่ยวข้องกับบัญชีนี้จะถูกลบออกจากระบบทั้งหมด
          </p>
        </div>
        <DialogFooter className="mt-4 gap-2 sm:justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            ยกเลิก
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "กำลังลบ..." : "ยืนยันการลบ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const PlaceholderDeleteUserButton = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground cursor-not-allowed"
            disabled
          >
            <TrashIcon className="h-4 w-4" />
            <span className="sr-only">Cannot Delete Admin</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>ไม่สามารถลบผู้ดูแลระบบได้</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
