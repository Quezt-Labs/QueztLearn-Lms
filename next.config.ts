import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
