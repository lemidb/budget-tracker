import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
   experimental: {
    // Disable API routes during build if needed
  },
  // Skip type checking and linting during build to make it faster
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
