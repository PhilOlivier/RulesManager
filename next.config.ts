import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // your other config options...
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,  // Add this line to ignore TypeScript errors
  },
} as any;

export default nextConfig;