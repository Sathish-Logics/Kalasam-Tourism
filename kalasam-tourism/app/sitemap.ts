import type { MetadataRoute } from "next";
import { getContent, getSettings } from "@/lib/content";
import { entryPath, siteIndexable, siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!siteIndexable) return [];
  const [content, settings] = await Promise.all([getContent(), getSettings()]);
  const pages = ["/", "/journeys", "/destinations", "/temple-circuits", "/family-ceremonies", "/senior-assistance", "/b2b-partners", "/plan-my-journey", "/contact", ...(settings.privacy_text ? ["/privacy"] : [])];
  const detailPages = content.filter((item) => !item.noindex && item.kind !== "testimonial" && !item.canonical_url).map((item) => ({ url: `${siteUrl}${entryPath(item)}`, lastModified: new Date(item.updated_at) }));
  return [...pages.map((path) => ({ url: `${siteUrl}${path}` })), ...detailPages].filter((item, index, all) => all.findIndex((candidate) => candidate.url === item.url) === index);
}
