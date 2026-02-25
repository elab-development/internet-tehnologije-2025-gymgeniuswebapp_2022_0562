import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output za Docker
  output: 'standalone',

  // Opciono: optimizacije
  reactStrictMode: true,
};

export default nextConfig;
