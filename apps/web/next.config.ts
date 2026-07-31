import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@vorzop/ui"],
  experimental: {
    optimizePackageImports: ["lucide-react", "@vorzop/ui"],
  },
};

export default nextConfig;
