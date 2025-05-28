"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";
import { CheckCircle2, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SuccessPage = () => {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="container mx-auto py-16 flex flex-col items-center">
      <div className="max-w-md w-full">
        <Card className="border-green-100 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-6">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-green-700">
              ชำระเงินสำเร็จ!
            </CardTitle>
            <CardDescription className="text-center pt-2">
              ขอบคุณสำหรับการสั่งซื้อ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4 border border-green-100">
              <p className="text-center text-sm text-green-800">
                เราได้รับการชำระเงินของคุณแล้ว
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button asChild className="w-full">
              <Link href="/main">
                <Home className="mr-2 h-4 w-4" />
                กลับไปหน้าหลัก
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            หากคุณมีคำถามเพิ่มเติม กรุณาติดต่อทีมงานของเรา
          </p>
          <Link
            href="mailto:support@example.com"
            className="text-sm text-blue-600 hover:underline"
          >
            support@example.com
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
