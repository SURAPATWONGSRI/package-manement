import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import ReturnButton from "@/components/return-button";

export default function page() {
  return (
    <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-8">
        <ReturnButton href="/login" label="login" />

        <h1 className="text-3xl font-bold">Forgot Password?</h1>
      </div>

      <p className="text-muted-foreground">
        No worries, we&apos;ll send you reset instructions{" "}
      </p>

      <ForgotPasswordForm />
    </div>
  );
}
