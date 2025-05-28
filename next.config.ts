import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  serverExternalPackages: ["@node-rs/argon2"],

  // Performance optimizations
  productionBrowserSourceMaps: false, // Disables source maps in production for smaller bundles
  swcMinify: true, // Use SWC minifier for better performance
  poweredByHeader: false, // Remove X-Powered-By header

  // Optimize images and fonts
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60, // Cache images for at least 60 seconds
  },

  // Enable React strict mode for better development
  reactStrictMode: true,

  // Experimental optimizations
  experimental: {
    // Optimize packages by including only what's needed
    optimizeCss: true,
    // Server components (already enabled by default in App Router)

    // Specify in-memory cache size

    // Pre-fetch critical pages on hover
    workerThreads: true,
    // Optimize package imports
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-avatar",
    ],
  },
};

export default nextConfig;
