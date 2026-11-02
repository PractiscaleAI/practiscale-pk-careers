import type { MetadataRoute } from "next";
import { routes, siteUrl } from "@/lib/content";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl + "/", changeFrequency: "monthly", priority: 1 },
    ...routes
      .filter((path) => path !== "/")
      .map((path) => ({
        url: siteUrl + path,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
  ];
}
