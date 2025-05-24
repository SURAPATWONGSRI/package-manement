import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function AccessDenied() {
  return (
    <div className="h-screen w-full flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-300" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Access Denied
          </CardTitle>
          <CardDescription className="text-center">
            You don't have permission to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This area is restricted to administrators only. If you believe this
            is an error, please contact the system administrator.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/profile">Back to Profile</Link>
          </Button>
          <Button asChild>
            <Link href="/">Go to Homepage</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
