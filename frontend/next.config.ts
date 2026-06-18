import type { NextConfig } from "next";

const API_PROXY = process.env.API_PROXY_URL ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_PROXY}/:path*`,
      },
    ];
  },
};

export default nextConfig;
