import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Rewrite real subdomain requests to client pages (for production with custom domain)
      {
        source: "/:path*",
        destination: "/:subdomain/:path*",
        has: [
          {
            type: "host",
            value: "(?<subdomain>[^.]+)\\.queztlearn\\.in",
          },
        ],
      },
      // Rewrite Vercel path-based subdomains to client pages
      {
        source: "/:client/:path*",
        destination: "/[client]/:path*",
        has: [
          {
            type: "host",
            value: "quezt-learn-lms\\.vercel\\.app",
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
