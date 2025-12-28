import type { NextConfig } from "next";

const nextConfig = {
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