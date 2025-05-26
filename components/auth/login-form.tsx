"use client";
import { signInEmailAction } from "@/actions/sign-in-email.action";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
        // Handle error case
        console.log("Login error detected:", result.error);
        setErrorMessage(result.error);
        setIsPending(false);
        return;
      }

      // Success case
      console.log("Login successful, redirecting...");
      setIsPending(false);
      toast.success("เข้าสู่ระบบสำเร็จ");

      // Navigate to profile page
      router.push("/profile");
    } catch (error) {
      // Handle unexpected errors
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
        <Alert variant="destructive" className="mb-4 bg-destructive/10">
          <AlertTitle className="font-semibold">Error</AlertTitle>
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
        <div className="flex justify-between items-center gap-2">
          <Label htmlFor="password">Password</Label>
          <Link
            href={"/forgot-password"}
            className="text-xs italic hover:underline text-muted-foreground hover:text-foreground"
          >
            Forgot Password?
          </Link>
        </div>
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
