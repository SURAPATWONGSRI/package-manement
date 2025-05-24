import ReturnButton from "@/components/return-button";
import { SendVerificationEmailForm } from "@/components/send-verification-email-form";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Verify Email",
};

interface PageProps {
  searchParams: Promise<{ error: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const error = (await searchParams).error;

  if (!error) redirect("/profile");

  return (
    <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-4">
        <ReturnButton href="/login" label="Login" />

        <h1 className="text-3xl font-bold">Verify Email</h1>
      </div>

      <p className="text-destructive">
        <span className="capitalize">
          {error.replace(/_/g, " ").replace(/-/g, " ")}
        </span>{" "}
        - กรุณากรอกอีเมลอีกครั้งเพื่อยืนยันตัวตนใหม่.
      </p>

      <SendVerificationEmailForm />
    </div>
  );
}
