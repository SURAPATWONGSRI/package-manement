"use client";
import { signInEmailAction } from "@/actions/sign-in-email.action";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

const AdminLoginForm = () => {
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  // Handle form submit
  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setErrorMessage(null); // ล้างข้อความผิดพลาดเดิม
    const formData = new FormData(evt.target as HTMLFormElement);

    setIsPending(true);

    try {
      console.log("Starting admin login process...");
      const result = await signInEmailAction(formData);
      console.log("Admin login action result:", result);

      if (result.error) {
        // มีข้อผิดพลาด แสดง error และไม่นำทางไปที่อื่น
        console.log("Login error detected:", result.error);
        setErrorMessage(result.error);
        setIsPending(false);
        return; // ออกจากฟังก์ชันทันทีเมื่อพบข้อผิดพลาด
      }

      // ตรวจสอบอีกรอบว่าไม่มีข้อผิดพลาดจริงๆ
      if (result.error === null) {
        console.log("Admin login successful, redirecting...");
        // ล็อกอินสำเร็จ
        setIsPending(false);
        toast.success("เข้าสู่ระบบสำเร็จ");

        // ดีเลย์การนำทางเล็กน้อยเพื่อให้แน่ใจว่า state ถูกอัปเดต
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 100);
      } else {
        // กรณีที่ result.error ไม่ใช่ null แต่ก็ไม่ได้เป็น string ที่มีค่า
        console.error("Unexpected error state:", result);
        setErrorMessage(
          "เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดลองอีกครั้งในภายหลัง"
        );
        setIsPending(false);
      }
    } catch (error) {
      // จับข้อผิดพลาดที่อาจเกิดขึ้นระหว่างการเรียก API
      console.error("Unexpected error during login:", error);
      setErrorMessage(
        "เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดลองอีกครั้งในภายหลัง"
      );
      setIsPending(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          ระบบจัดการ
        </CardTitle>
        <CardDescription className="text-center">
          เข้าสู่ระบบเพื่อจัดการข้อมูลและการตั้งค่าต่างๆ
        </CardDescription>
      </CardHeader>
      <CardContent>
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>เข้าสู่ระบบไม่สำเร็จ</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="กรอกอีเมลของคุณ"
              required
              disabled={isPending}
              autoComplete="email"
              className={errorMessage ? "border-destructive" : ""}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">รหัสผ่าน</Label>
              <a
                href="/reset-password"
                className="text-xs text-primary hover:underline"
              >
                ลืมรหัสผ่าน?
              </a>
            </div>
            <Input
              type="password"
              id="password"
              name="password"
              placeholder="กรอกรหัสผ่านของคุณ"
              required
              disabled={isPending}
              autoComplete="current-password"
              className={errorMessage ? "border-destructive" : ""}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังเข้าสู่ระบบ...
              </>
            ) : (
              "เข้าสู่ระบบ"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-xs text-muted-foreground">
          สงวนสิทธิ์สำหรับเจ้าหน้าที่ผู้ดูแลระบบเท่านั้น
        </p>
      </CardFooter>
    </Card>
  );
};

export default AdminLoginForm;
