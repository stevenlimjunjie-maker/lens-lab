import type { NextConfig } from "next";

// Dev-only pages (e.g. the sample image exporter) use the .dev.tsx extension
// so they never ship in the production static export.
const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  devIndicators: false,
  pageExtensions: isDev ? ["tsx", "ts", "dev.tsx"] : ["tsx", "ts"],
};

export default nextConfig;
