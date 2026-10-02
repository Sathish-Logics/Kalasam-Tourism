import type { MetadataRoute } from "next";
import { siteIndexable, siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: siteIndexable
      ? { userAgent: "*", allow: "/", disallow: ["/admin/", "/auth/", "/api/"] }
      : { userAgent: "*", disallow: "/" },
    ...(siteIndexable ? { sitemap: `${siteUrl}/sitemap.xml` } : {}),
  };
}
