import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
};
export default function Home() {
  return (
    <div>
      <p className="text-xl">Homepage</p>
    </div>
  );
}
