import type { Metadata } from "next";
import type { ContentEntry } from "./types";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const siteIndexable = process.env.NEXT_PUBLIC_SITE_INDEXABLE === "true" && !!process.env.NEXT_PUBLIC_SITE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_URL;

export function pageMetadata(title: string, description: string, path: string, image = "/opengraph-image", noindex = false, canonicalOverride = ""): Metadata {
  const canonical = canonicalOverride || `${siteUrl}${path}`;
  return { title, description, alternates: { canonical }, robots: { index: siteIndexable && !noindex, follow: true }, openGraph: { type: "website", locale: "en_IN", siteName: "Kalasam Tourism", title, description, url: canonical, images: [{ url: image, alt: title }] }, twitter: { card: "summary_large_image", title, description, images: [image] } };
}

export function entryPath(entry: Pick<ContentEntry, "kind" | "slug">) {
  const prefixes = { destination: "/destinations/", journey: "/journeys/", circuit: "/temple-circuits/", service: "/", testimonial: "/" };
  return `${prefixes[entry.kind]}${entry.slug}`;
}

export function jsonLd(value: unknown) { return JSON.stringify(value).replace(/</g, "\\u003c"); }
