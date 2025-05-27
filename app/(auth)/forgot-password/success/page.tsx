import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-8 py-16">
      <div className="flex flex-col items-center space-y-8 w-full max-w-md">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>

        <div className="text-center space-y-2 w-full">
          <h1 className="text-2xl font-semibold tracking-tight">สำเร็จ</h1>
          <p className="text-muted-foreground">
            You have a send password reset link to your email.
          </p>
        </div>

        <Button asChild variant="default" className="w-full">
          <Link href="/login">เข้าสู่ระบบ</Link>
        </Button>
      </div>
    </div>
  );
}
