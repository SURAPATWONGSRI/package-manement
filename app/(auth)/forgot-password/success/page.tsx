import { Button } from "@/components/ui/button";
import {
  Card,
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
            Success!
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            You have a send password reset link to your email.
          </CardDescription>
        </CardHeader>

        <CardFooter className="flex flex-col space-y-2 pt-0">
          <Button asChild variant="default" className="w-full">
            <Link href="/login">เข้าสู่ระบบ</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
