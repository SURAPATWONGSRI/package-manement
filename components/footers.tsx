import { Package } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t py-6 bg-muted/5">
      <div className="px-4 md:px-8 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Package className="h-4 w-4" />
            </div>
            <p className="text-sm font-medium">Package Management</p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:underline"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:underline"
              >
                Terms of Service
              </Link>
            </div>
            <p className="text-center text-xs text-muted-foreground">
              © {currentYear} Package Management. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
