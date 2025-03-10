import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/v1/api/:path*",
        destination:
          process.env.NODE_ENV === "production"
            ? "http://localhost:3000"
            : process.env.BACKEND_URL! + "/:path*",
      },
    ];
  },
};

export default nextConfig;
