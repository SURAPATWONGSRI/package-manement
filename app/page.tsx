import { Hero } from "@/components/Hero";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Package Management System | Package Management",
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
    </div>
  );
}
