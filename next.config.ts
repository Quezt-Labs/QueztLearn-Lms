import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Rewrite subdomain requests to client pages
      {
        source: "/:path*",
        destination: "/[client]/:path*",
        has: [
          {
            type: "host",
            value: "(?<subdomain>.*)\\.queztlearn\\.in",
          },
        ],
      },
    ];
  },
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
        ],
      },
    ];
  },
};

export default nextConfig;
