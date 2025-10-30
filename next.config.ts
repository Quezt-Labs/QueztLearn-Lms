import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Ensure Turbopack uses this workspace as the root when multiple lockfiles exist
    // Types may lag behind; this field is supported by Next.js runtime
    // @ts-expect-error - turbopack root option may not be in type yet
    turbopack: {
      root: __dirname,
    },
  },
  images: {
    domains: [
      "quezt-learn-lms.vercel.app",
      "images.unsplash.com",
      "d2qbkdyhv7dt4j.cloudfront.net",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.queztlearn.com",
      },
    ],
  },
  // Configure to handle subdomains
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
