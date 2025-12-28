import type { NextConfig } from "next";

const nextConfig = {
  webpack: (config) => config,
  experimental: {
    turbo: {
      rules: {
        "*.test.ts": { ignore: true },
        "*.spec.ts": { ignore: true },
      },
    },
  },
};

export default nextConfig;