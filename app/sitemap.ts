import type { MetadataRoute } from "next";
import { APP_TYPES, TOOLS } from "@/lib/catalog";
import { listSlugs } from "@/lib/queries";
import { siteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const slugs = await listSlugs();
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/submit`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/sponsor`, changeFrequency: "weekly", priority: 0.5 },
    ...TOOLS.map((tool) => ({
      url: `${base}/tools/${tool.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...APP_TYPES.map((type) => ({
      url: `${base}/types/${type.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...slugs.map((slug) => ({
      url: `${base}/builds/${slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
