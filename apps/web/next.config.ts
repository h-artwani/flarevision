import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@flarevision/shared-types"],
};

export default nextConfig;
