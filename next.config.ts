import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
  devIndicators: false,
  async headers() {
    // These source paths carry an immutable media revision. New media must
    // receive a new filename/revision rather than replacing a cached source.
    return [
      "/earnings-v7/:path*",
      "/media/ceo-prime-v1/:path*",
      "/media/who-we-are/office-scroll-v2.mp4",
      "/media/career-paths/brain-surface-v1.bin",
      "/media/career-paths/brain-depth-v1.bin.gz",
    ].map((source) => ({
      source,
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    }));
  },
};
export default nextConfig;
