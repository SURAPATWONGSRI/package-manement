import ReturnButton from "@/components/return-button";
import { auth } from "@/lib/auth";
import { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
};
export default async function page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/admin");

  if (session.user.role !== "ADMIN") {
    return (
      <div className="px-8 py-16 container mx-auto max-w-screen-lg space-y-8">
        <div className="space-y-8">
          <ReturnButton href={"/profile"} label="profile"></ReturnButton>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
      </div>
    );
  }

  return <p>YOU ARE ADMIN!!</p>;
}
