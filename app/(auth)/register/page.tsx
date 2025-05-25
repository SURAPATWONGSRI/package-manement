import RegisterForm from "@/components/auth/register-form";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ลงทะเบียน",
};
const page = () => {
  return (
    <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-8">
        <h1 className="text-4xl font-bold">Register</h1>
      </div>
      <RegisterForm />
      <p className="text-muted-foreground text-sm">
        Already have an account?{" "}
        <Link href={"/login"} className="text-foreground hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default page;
