import RegisterForm from "@/components/register-form";
import type { Metadata } from "next";

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
    </div>
  );
};

export default page;
