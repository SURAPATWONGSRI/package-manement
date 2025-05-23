"use client";
import { signInEmailAction } from "@/actions/sign-in-email";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const LoginForm = () => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  // Handle form submit
  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const formData = new FormData(evt.target as HTMLFormElement);

    setIsPending(true);

    const { error } = await signInEmailAction(formData);

    setIsPending(false);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Login successful");
      router.push("/profile");
    }
  }
  return (
    <form onSubmit={handleSubmit} className="max-w-sm w-full space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" name="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input type="password" id="password" name="password" required />
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
