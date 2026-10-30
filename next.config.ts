import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  // Standalone is only needed for the Docker image. Keep the Vercel build unchanged.
  output: process.env.PRACTISCALE_DOCKER_BUILD === "1" ? "standalone" : undefined,
  poweredByHeader: false,
  reactStrictMode: true,
  images: { formats: ["image/avif", "image/webp"] },
  devIndicators: false,
  async headers() {
    // Keep the policy compatible with Next's inline bootstrap scripts and the
    // same-origin preloader iframe. Restrict higher-risk browser capabilities.
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      {
        key: "Permissions-Policy",
        value:
          "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
      },
      {
        key: "Content-Security-Policy",
        value:
          "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'",
      },
    ];

    // These source paths carry an immutable media revision. New media must
    // receive a new filename/revision rather than replacing a cached source.
    const immutableMedia = [
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

    return [{ source: "/:path*", headers: securityHeaders }, ...immutableMedia];
  },
};
export default nextConfig;
