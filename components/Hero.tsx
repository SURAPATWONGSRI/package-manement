import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";

const Hero = () => {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center opacity-100">
        <img
          alt="background"
          src="https://shadcnblocks.com/images/block/patterns/square-alt-grid.svg"
          className="opacity-90 [mask-image:radial-gradient(75%_75%_at_center,white,transparent)]"
        />
      </div>
      <div className="relative z-10 container">
        <div className="mx-auto flex max-w-5xl flex-col items-center">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="rounded-xl bg-background/30 p-4 shadow-sm backdrop-blur-sm">
              <img
                src="https://shadcnblocks.com/images/block/block-3.svg"
                alt="logo"
                className="h-16"
              />
            </div>
            <div>
              <h1 className="mb-6 text-2xl font-bold tracking-tight text-pretty lg:text-5xl">
                Build your next project with{" "}
                <span className="text-primary">Blocks</span>
              </h1>
              <p className="mx-auto max-w-3xl text-muted-foreground lg:text-xl">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Elig
                doloremque mollitia fugiat omnis! Porro facilis quo animi
                consequatur. Explicabo.
              </p>
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <Button
                size={"lg"}
                className="shadow-sm transition-shadow hover:shadow"
              >
                <Link href={"/login"}>เริ่มต้นใช้งาน</Link>
              </Button>
            </div>
            <div className="mt-20 flex flex-col items-center gap-5">
              <p className="font-medium text-muted-foreground lg:text-left">
                Development ด้วยเทคโนโลยี Open Source
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {/* Logos */}
                {[
                  ["TypeScript", "typescript-icon.svg"],
                  ["Next.js", "nextjs-icon.svg"],

                  ["shadcn/ui", "shadcn-ui-icon.svg"],
                  ["Tailwind CSS", "tailwind-icon.svg"],
                ].map(([label, img], i) => (
                  <a
                    key={i}
                    href="#"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "group flex aspect-square h-12 items-center justify-center p-0"
                    )}
                  >
                    <img
                      src={`https://shadcnblocks.com/images/block/logos/${img}`}
                      alt={`${label} logo`}
                      className="h-6 saturate-0 transition-all group-hover:saturate-100"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export { Hero };
