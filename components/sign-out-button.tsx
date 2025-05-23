"use client";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "./ui/button";

export const SignOutButton = () => {
  const router = useRouter();

  async function handleClick() {
    await signOut({
      fetchOptions: {
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
        onSuccess: () => {
          toast.success("Sign out successfully");
          router.push("/login");
        },
      },
    });
  }

  return (
    <Button onClick={handleClick} size="sm" variant={"destructive"}>
      sign-out-button
    </Button>
  );
};
