"use client";
import { signInEmailAction } from "@/actions/sign-in-email.action";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const LoginForm = () => {
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginMethod, setLoginMethod] = useState<"email" | "username">("email");
  const router = useRouter();

  // Handle form submit
  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setErrorMessage(null); // ล้างข้อความผิดพลาดเดิม
    const formData = new FormData(evt.target as HTMLFormElement);

    setIsPending(true);

    try {
      console.log(`Starting login process using ${loginMethod}...`);

      // Add the login method to formData
      formData.append("loginMethod", loginMethod);

      const result = await signInEmailAction(formData);
      console.log("Login action result:", result);

      if (result.error) {
        // Handle error case
        console.log("Login error detected:", result.error);
        setErrorMessage(result.error);
        setIsPending(false);
        return;
      }

      if (result.redirect) {
        // Handle redirect case
        console.log("Redirect required:", result.redirect);
        router.push(result.redirect);
        setIsPending(false);
        return;
      }

      // Success case
      console.log("Login successful, redirecting...");
      setIsPending(false);
      toast.success("เข้าสู่ระบบสำเร็จ");

      // Navigate to main page
      router.push("/main");
    } catch (error) {
      // Handle unexpected errors
      console.error("Unexpected error during login:", error);
      // More detailed error reporting
      const errorMessage =
        error instanceof Error
          ? `เกิดข้อผิดพลาด: ${error.message}`
          : "เกิดข้อผิดพลาดในการเข้าสู่ระบบ โปรดลองอีกครั้งในภายหลัง";

      setErrorMessage(errorMessage);
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

      <Tabs
        defaultValue="email"
        className="w-full"
        onValueChange={(value) => setLoginMethod(value as "email" | "username")}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="username">Username</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              required={loginMethod === "email"}
              disabled={isPending || loginMethod !== "email"}
              className={errorMessage ? "border-destructive" : ""}
            />
          </div>
        </TabsContent>

        <TabsContent value="username" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              id="username"
              name="username"
              required={loginMethod === "username"}
              disabled={isPending || loginMethod !== "username"}
              className={errorMessage ? "border-destructive" : ""}
            />
          </div>
        </TabsContent>
      </Tabs>

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
