"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";

const Hero = () => {
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
        <img
          alt="background"
          src="https://shadcnblocks.com/images/block/patterns/square-alt-grid.svg"
          className="opacity-90 [mask-image:radial-gradient(75%_75%_at_center,white,transparent)]"
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
              <img
                src="https://shadcnblocks.com/images/block/block-3.svg"
                alt="logo"
                className="h-16 bg-secondary rounded-lg"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.h1
                className="mb-6 text-2xl font-bold tracking-tight text-pretty lg:text-5xl"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Senior-Project
              </motion.h1>
              <motion.p
                className="mx-auto max-w-3xl text-muted-foreground lg:text-xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Elig
                doloremque mollitia fugiat omnis! Porro facilis quo animi
                consequatur. Explicabo.
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
                  className="shadow-sm transition-shadow hover:shadow"
                >
                  <Link href={"/login"}>เริ่มต้นใช้งาน</Link>
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
                  ["Supabase", "supabase.svg"],
                  ["Prisma ORM", "light-prisma-svgrepo-com.svg"],
                  ["PostgreSQL", "postgresql-icon.svg"],
                  ["Better Auth", "Better Auth_dark.svg"],
                  ["Omise", "omiseco-icon.svg"],
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
                    <motion.img
                      src={`https://armzdhwelkuwwftkvoap.supabase.co/storage/v1/object/public/profile//${img}`}
                      alt={`${label} logo`}
                      className="h-6 saturate-100 transition-all group-hover:saturate-100"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    />
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
