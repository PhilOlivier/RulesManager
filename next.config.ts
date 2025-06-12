import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // your other config options...

  eslint: {
    ignoreDuringBuilds: true,
  },
} as any;

export default nextConfig;
