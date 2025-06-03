import { Footer } from "@/components/footers";
import { NavbarUser } from "@/components/users/navbar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import React from "react";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="min-h-screen flex flex-col">
      <NavbarUser session={session} />
      <main className="flex-grow container mx-auto p-4">{children}</main>

      <Footer />
    </div>
  );
}
