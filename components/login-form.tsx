"use client";
import { signInEmailAction } from "@/actions/sign-in-email.action";
import { AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const LoginForm = () => {
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
      console.log("Starting login process...");
      const result = await signInEmailAction(formData);
      console.log("Login action result:", result);

      if (result.error) {
        // มีข้อผิดพลาด แสดง error และไม่นำทางไปที่อื่น
        console.log("Login error detected:", result.error);
        setErrorMessage(result.error);
        setIsPending(false);
        return; // ออกจากฟังก์ชันทันทีเมื่อพบข้อผิดพลาด
      }

      // ตรวจสอบอีกรอบว่าไม่มีข้อผิดพลาดจริงๆ
      if (result.error === null) {
        console.log("Login successful, redirecting...");
        // ล็อกอินสำเร็จ
        setIsPending(false);
        toast.success("เข้าสู่ระบบสำเร็จ");

        // ดีเลย์การนำทางเล็กน้อยเพื่อให้แน่ใจว่า state ถูกอัปเดต
        setTimeout(() => {
          router.push("/profile");
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
    <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-4">
      {errorMessage && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>เข้าสู่ระบบไม่สำเร็จ</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          name="email"
          required
          disabled={isPending}
          className={errorMessage ? "border-destructive" : ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          type="password"
          id="password"
          name="password"
          required
          disabled={isPending}
          className={errorMessage ? "border-destructive" : ""}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Login...
          </>
        ) : (
          "Login"
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
