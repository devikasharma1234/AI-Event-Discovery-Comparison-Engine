import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    const backend = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");
    return {
      fallback: [{ source: "/api/:path*", destination: `${backend}/api/:path*` }],
    };
  },
};

export default nextConfig;
