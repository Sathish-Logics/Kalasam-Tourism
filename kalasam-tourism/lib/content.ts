import "server-only";
import { cache } from "react";
import { demoContent, demoSettings } from "@/lib/demo-content";
import { createPublicSupabase, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ContentEntry, ContentKind, SiteSettings } from "@/lib/types";

export { isSupabaseConfigured } from "@/lib/supabase/server";

/** Demo content is used only before connecting a database, never on a DB error. */
export const getContent = cache(async (kind?: ContentKind): Promise<ContentEntry[]> => {
  if (!isSupabaseConfigured()) return demoContent.filter((entry) => entry.published && (!kind || entry.kind === kind));
  let query = createPublicSupabase().from("content_entries").select("*").eq("published", true).order("created_at");
  if (kind) query = query.eq("kind", kind);
  const { data, error } = await query;
  if (error) throw new Error("We could not load the latest content. Please try again.");
  return (data || []) as ContentEntry[];
});

export const getEntry = cache(async (kind: ContentKind, slug: string): Promise<ContentEntry | null> => {
  if (!isSupabaseConfigured()) return demoContent.find((entry) => entry.published && entry.kind === kind && entry.slug === slug) || null;
  const { data, error } = await createPublicSupabase().from("content_entries")
    .select("*").eq("published", true).eq("kind", kind).eq("slug", slug).maybeSingle();
  if (error) throw new Error("We could not load this page. Please try again.");
  return data as ContentEntry | null;
});

export const getSettings = cache(async (): Promise<SiteSettings> => {
  if (!isSupabaseConfigured()) return demoSettings;
  const { data, error } = await createPublicSupabase().from("site_settings").select("*").eq("id", true).single();
  if (error) throw new Error("We could not load the site settings. Please try again.");
  return data as SiteSettings;
});

export const getSlugRedirect = cache(async (path: string): Promise<string | null> => {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await createPublicSupabase().from("slug_redirects")
    .select("target_path").eq("source_path", path).maybeSingle();
  if (error) throw new Error("We could not load this page. Please try again.");
  return data?.target_path || null;
});
