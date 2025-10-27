import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "quezt-learn-lms.vercel.app",
      "images.unsplash.com",
      "d2qbkdyhv7dt4j.cloudfront.net",
    ],
  },
  async rewrites() {
    return [
      // Rewrite real subdomain requests to client pages (for production with custom domain)
      {
        source: "/:path*",
        destination: "/[client]/:path*",
        has: [
          {
            type: "host",
            value: "(?<subdomain>[^.]+)\\.queztlearn\\.com",
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
