import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/content";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl + "/", changeFrequency: "monthly", priority: 1 },
    ...[
      "/training-programs/appointment-setter",
      "/training-programs/virtual-assistant",
      "/jobs",
    ].map((path) => ({
      url: siteUrl + path,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
