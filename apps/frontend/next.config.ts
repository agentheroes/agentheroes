import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    proxyTimeout: 90_000,
  },
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/v1/api/:path*",
        destination: 'http://localhost:3000/:path*',
      },
    ];
  },
};

export default nextConfig;
