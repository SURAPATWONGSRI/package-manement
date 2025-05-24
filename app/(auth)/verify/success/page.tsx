import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md border-muted/40 shadow-sm">
        <CardHeader className="space-y-1 flex flex-col items-center text-center pb-2">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            ส่งอีเมลสำเร็จ
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            เราได้ส่งลิงก์ยืนยันตัวตนไปยังอีเมลของคุณแล้ว
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          <p>กรุณาตรวจสอบกล่องจดหมายของคุณและคลิกที่ลิงก์เพื่อยืนยันอีเมล</p>
          <p className="mt-2">
            หากคุณไม่ได้รับอีเมล กรุณาตรวจสอบโฟลเดอร์สแปSpamหรือขยะ
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 pt-0">
          <Button asChild variant="default" className="w-full">
            <Link href="/login">เข้าสู่ระบบ</Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
          >
            <Link href="/verify">ส่งอีเมลยืนยันอีกครั้ง</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
