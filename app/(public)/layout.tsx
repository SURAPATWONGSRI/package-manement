import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Package Management System",
  description: "A system for managing packages and deliveries",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Package Management System</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4">{children}</main>

      <footer className="bg-gray-100 p-4 border-t">
        <div className="container mx-auto text-center text-gray-600">
          <p>
            © {new Date().getFullYear()} Package Management System. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
