import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/v1/api/:path*",
        destination: 'http://localhost:3000/:path*'
      },
    ];
  },
};

export default nextConfig;
