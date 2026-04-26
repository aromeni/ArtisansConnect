import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Explicitly set project root so Turbopack doesn't pick up
    // lockfiles from parent directories.
    root: path.resolve(__dirname),
  },
  // Allow images from Cloudinary CDN and trusted sources
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        // For local avatar placeholders in development
        protocol: "https",
        hostname: "ui-avatars.com",
      },
    ],
  },

  // Strict security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
      // Prevent caching of private API routes
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },

  // Rewrites for Paystack webhook (ensures raw body is available)
  async rewrites() {
    return [];
  },

  experimental: {},
};

export default nextConfig;
