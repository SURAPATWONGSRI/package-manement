import { Footer } from "@/components/footers";
import { NavbarUser } from "@/components/users/navbar";
import React from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavbarUser />

      <main className="flex-grow container mx-auto p-4">{children}</main>

      <Footer />
    </div>
  );
}
