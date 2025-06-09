"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonVariants } from "./ui/button";

const Hero = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleGetStarted = () => {
    setIsLoading(true);
    // Loading จะปิดโดยอัตโนมัติเมื่อเปลี่ยนหน้า
    router.push("/login");
  };
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const logoVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const techStackVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.8,
      },
    },
  };

  const techItemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
      <motion.div
        className="absolute inset-0 flex items-center justify-center opacity-100"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <Image
          alt="background"
          src="https://shadcnblocks.com/images/block/patterns/square-alt-grid.svg"
          className="opacity-90 [mask-image:radial-gradient(75%_75%_at_center,white,transparent)]"
          width={1200}
          height={800}
          priority
        />
      </motion.div>

      <div className="relative z-10 container">
        <motion.div
          className="mx-auto flex max-w-5xl flex-col items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex flex-col items-center gap-6 text-center">
            <motion.div
              className="rounded-xl bg-primary p-4 shadow-sm backdrop-blur-sm"
              variants={logoVariants}
              whileHover={{
                scale: 1.05,
                rotate: 5,
                transition: { duration: 0.3 },
              }}
            >
              <Image
                src="https://shadcnblocks.com/images/block/block-3.svg"
                alt="logo"
                className="h-16 bg-secondary rounded-lg"
                width={64}
                height={64}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.h1
                className="mb-6 text-2xl font-bold tracking-tight text-pretty lg:text-5xl"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Package Management
              </motion.h1>
              <motion.p
                className="mx-auto max-w-3xl text-muted-foreground lg:text-xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                เลือกแพ็จเกจแล้วชำระเงินผ่าน พร้อมเพย์(PromptPay) โดยใช้ Stripe.
              </motion.p>
            </motion.div>

            <motion.div
              className="mt-6 flex justify-center gap-3"
              variants={itemVariants}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size={"lg"}
                  variant={"default"}
                  className="shadow-sm transition-shadow hover:shadow"
                  onClick={handleGetStarted}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      กำลังโหลด...
                    </>
                  ) : (
                    <Link href={"/login"}>เริ่มต้นใช้งาน</Link>
                  )}
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className="mt-20 flex flex-col items-center gap-5"
              variants={itemVariants}
            >
              <motion.p
                className="font-medium text-muted-foreground lg:text-left"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
              >
                Development ด้วยเทคโนโลยี Open Source
              </motion.p>

              <motion.div
                className="flex flex-wrap items-center justify-center gap-4"
                variants={techStackVariants}
              >
                {[
                  ["TypeScript", "typescript-icon.svg"],
                  ["Next.js", "nextjs-icon.svg"],
                  ["phpMyAdmin", "phpmyadmin-icon.svg"],
                  ["Prisma ORM", "light-prisma-svgrepo-com.svg"],
                  ["MySQl", "mysql-official.svg"],
                  ["Better Auth", "Better Auth_dark.svg"],
                  ["Stripe", "stripe-ar21.svg"],
                  ["shadcn/ui", "shadcn-ui-icon.svg"],
                  ["Tailwind CSS", "tailwind-icon.svg"],
                ].map(([label, img], i) => (
                  <motion.a
                    key={i}
                    href="#"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "group flex aspect-square h-12 items-center justify-center p-0"
                    )}
                    variants={techItemVariants}
                    whileHover={{
                      scale: 1.1,
                      y: -5,
                      transition: { duration: 0.2 },
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Image
                        src={`https://armzdhwelkuwwftkvoap.supabase.co/storage/v1/object/public/profile//${img}`}
                        alt={`${label} logo`}
                        className="h-6 saturate-100 transition-all group-hover:saturate-100"
                        width={24}
                        height={24}
                      />
                    </motion.div>
                  </motion.a>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export { Hero };
