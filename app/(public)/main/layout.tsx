import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Package Selection",
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
