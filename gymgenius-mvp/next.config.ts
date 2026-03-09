import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output za Docker
  output: 'standalone',

  // React strict mode disabled: react-google-charts incompatible with StrictMode double-render
  reactStrictMode: false,

  // Image optimization with remotePatterns (replaces deprecated domains)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'd2xdmhkmkbyw75.cloudfront.net', // Nutritionix images
      },
    ],
  },

  // Environment variables validation
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
