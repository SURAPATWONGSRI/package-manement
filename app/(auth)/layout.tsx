import Image from "next/image";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ส่วนด้านซ้าย: รูปภาพหรือ banner */}
      <div className="hidden md:block md:w-1/2 bg-foreground relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <Image
            src="/assets/images/bg.jpg"
            fill
            alt="Background Image"
            className="object-cover opacity-20"
            priority
            sizes="50vw"
            style={{ objectPosition: "center" }}
          />
        </div>
        <div className="relative z-10 flex items-center justify-center p-10 flex-col w-full h-full">
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-bold text-secondary mb-6">Package</h1>
            <p className="text-secondary/80 text-lg">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Perspiciatis nam eaque possimus ullam! Doloremque placeat libero
              reprehenderit natus sint, in fuga, reiciendis id earum omnis fugit
              rerum dignissimos odit debitis!
            </p>
          </div>
        </div>
      </div>

      {/* ส่วนด้านขวา: แบบฟอร์ม authentication */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-md">
          {/* แบบฟอร์ม (children) */}
          {children}
        </div>
      </div>
    </div>
  );
}
