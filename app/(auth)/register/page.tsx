import RegisterForm from "@/components/register-form";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ลงทะเบียน",
};
const page = () => {
  return (
    <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
      <div className="space-y-8">
        <h1 className="text-3xl font-semibold">Register</h1>
      </div>
      <RegisterForm />
      <p className="text-muted-foreground text-sm">
        Already have an account?{" "}
        <Link href={"/login"} className="hover:text-foreground">
          Login
        </Link>
      </p>
    </div>
  );
};

export default page;
