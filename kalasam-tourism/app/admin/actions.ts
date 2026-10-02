"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabase, isSupabaseConfigured, requireStaff } from "@/lib/supabase/server";
import { contentKinds, inquiryStatuses, type ActionState, type ContentKind } from "@/components/admin/types";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const field = (data: FormData, name: string) => String(data.get(name) ?? "").trim();
const list = (data: FormData, name: string) => field(data, name).split(/[,\n]/).map((value) => value.trim()).filter(Boolean);

function validImage(value: string) {
  if (!value) return true;
  if (value.startsWith("/images/") && !value.includes("..") && !value.includes("\\")) return true;
  try {
    const url = new URL(value);
    const storage = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    return url.protocol === "https:" && url.origin === storage.origin && url.pathname.startsWith("/storage/v1/object/public/media/");
  } catch { return false; }
}

export async function login(_state: ActionState, data: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) return { error: "Staff sign-in is not configured. Follow the Supabase setup instructions in the project README." };
  const email = field(data, "email");
  const password = String(data.get("password") ?? "");
  if (!email || email.length > 254 || !password || password.length > 200) return { error: "Enter your invited email address and password." };
  const supabase = await createServerSupabase();
  const { data: auth, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !auth.user) return { error: "Sign-in failed. Check your email and password, or ask your administrator for a new invitation." };
  const { data: staff, error: staffError } = await supabase.from("staff_users").select("user_id").eq("user_id", auth.user.id).maybeSingle();
  if (staffError || !staff) {
    await supabase.auth.signOut();
    return { error: "This account does not have staff access. Contact your administrator." };
  }
  redirect("/admin");
}

export async function logout() {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

export async function setPassword(_state: ActionState, data: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const password = String(data.get("password") ?? "");
  if (password.length < 12 || password.length > 200) return { error: "Use a password with 12 to 200 characters." };
  if (password !== data.get("confirmation")) return { error: "The passwords do not match." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Your password could not be saved. Try a new invitation or recovery link if your session has expired." };
  redirect("/admin");
}

export async function saveContent(_state: ActionState, data: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const id = field(data, "id");
  const kind = field(data, "kind") as ContentKind;
  const slug = field(data, "slug");
  const title = field(data, "title");
  const summary = field(data, "summary");
  const body = field(data, "body");
  const published = data.get("published") === "on";
  const noindex = data.get("noindex") === "on";
  if (id && !uuid.test(id)) return { error: "This content identifier is invalid. Open the entry from the content list." };
  if (!(contentKinds as readonly string[]).includes(kind)) return { error: "Choose a valid content type." };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 100) return { error: "Use a URL slug of up to 100 lowercase letters, numbers and hyphens." };
  if (kind === "service" && !["family-ceremonies", "senior-assistance", "b2b-partners"].includes(slug)) return { error: "Services use one of these URLs: family-ceremonies, senior-assistance, b2b-partners." };
  if (!title || title.length > 160 || summary.length > 500 || body.length > 20000) return { error: "A title is required (up to 160 characters). Keep the summary under 500 and body under 20,000 characters." };
  const hero_image = field(data, "hero_image");
  const social_image = field(data, "social_image");
  const image_alt = field(data, "image_alt");
  const seo_title = field(data, "seo_title");
  const seo_description = field(data, "seo_description");
  const canonical_url = field(data, "canonical_url");
  if (!validImage(hero_image) || !validImage(social_image)) return { error: "Use an image uploaded to your media library, or an existing /images/ path." };
  if (image_alt.length > 300 || seo_title.length > 160 || seo_description.length > 320 || canonical_url.length > 2048) return { error: "Keep alt text under 300 characters, SEO title under 160, and SEO description under 320." };
  if (canonical_url) {
    try {
      const canonical = new URL(canonical_url);
      const base = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
      if (canonical.origin !== base.origin || canonical.search || canonical.hash) throw new Error();
    } catch { return { error: "Canonical URL must be an absolute URL on this site's origin, with no query or hash." }; }
  }
  if (published && kind !== "testimonial" && (!summary || !body || (hero_image && !image_alt))) return { error: "Add a summary, meaningful body copy, and alt text for the hero image before publishing." };
  if (published && kind === "testimonial" && !body) return { error: "Add the client-approved quote before publishing this testimonial." };
  if (published && data.get("approved") !== "on") return { error: "Confirm the client approved the copy, factual claims and image rights before publishing." };
  const tags = list(data, "tags");
  const related_slugs = list(data, "related_slugs");
  const stops = field(data, "stops").split("\n").map((value) => value.trim()).filter(Boolean);
  if ([tags, related_slugs, stops].some((items) => items.length > 30 || items.some((item) => item.length > 200))) return { error: "Use up to 30 tags, related slugs, and stops, each under 200 characters." };
  if (related_slugs.some((value) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))) return { error: "Related entries must be lowercase URL slugs, separated by commas." };
  const region = field(data, "region");
  const duration = field(data, "duration");
  if (region.length > 160 || duration.length > 100) return { error: "Keep region under 160 characters and duration under 100." };
  const payload = { ...(id ? { id } : {}), kind, slug, title, summary, body, hero_image, image_alt, region, duration, tags, related_slugs, stops, published, seo_title, seo_description, canonical_url, social_image, noindex };
  const { data: savedId, error } = await supabase.rpc("save_content_entry", { payload });
  if (error) {
    const conflict = error.code === "23505" || /slug|alias|redirect|kind/i.test(error.message);
    return { error: conflict ? "This URL is already used, reserved by a previous URL, or the content type cannot be changed. Choose another slug." : "The content could not be saved. Check your connection and the database setup, then try again." };
  }
  revalidatePath("/", "layout");
  if (!id && typeof savedId === "string") redirect(`/admin/content/${savedId}?created=1`);
  return { success: published ? "Published. The website and sitemap will use this content." : "Draft saved. This entry is not publicly available." };
}

export async function saveSettings(_state: ActionState, data: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const fields = ["brand_name", "email", "phone", "whatsapp", "address", "instagram", "facebook", "privacy_text", "consent_text", "consent_version"] as const;
  const values = Object.fromEntries(fields.map((name) => [name, field(data, name)]));
  if (!values.brand_name || values.brand_name.length > 100) return { error: "Enter a brand name of up to 100 characters." };
  if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return { error: "Enter a valid contact email address." };
  if (values.whatsapp && !/^\d{7,15}$/.test(values.whatsapp)) return { error: "Enter the WhatsApp number with country code and digits only (7 to 15 digits)." };
  if (values.phone.length > 50 || values.address.length > 500 || values.email.length > 254 || values.consent_text.length > 1000 || values.privacy_text.length > 30000) return { error: "One or more fields exceeds its maximum length." };
  if (values.consent_version.length > 64) return { error: "Keep the consent version under 64 characters." };
  for (const name of ["instagram", "facebook"]) {
    if (!values[name]) continue;
    try { const url = new URL(values[name]); if (url.protocol !== "https:" || values[name].length > 500) throw new Error(); }
    catch { return { error: "Social links must be valid HTTPS URLs of up to 500 characters." }; }
  }
  const { data: existing, error: readError } = await supabase.from("site_settings").select("consent_text,consent_version").eq("id", true).maybeSingle();
  if (readError) return { error: "Settings could not be read. Check database setup and try again." };
  if (existing && existing.consent_text !== values.consent_text && existing.consent_version === values.consent_version) return { error: "Change the consent version when updating its wording so inquiry consent remains traceable." };
  const { error } = await supabase.from("site_settings").upsert({ id: true, ...values });
  if (error) return { error: "Settings could not be saved. Please try again." };
  revalidatePath("/", "layout");
  return { success: "Settings saved. Public contact details and privacy wording are updated." };
}

export async function updateInquiry(_state: ActionState, data: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const id = field(data, "id");
  const status = field(data, "status");
  if (!uuid.test(id) || !(inquiryStatuses as readonly string[]).includes(status)) return { error: "Choose a valid inquiry and status." };
  const { data: updated, error } = await supabase.from("inquiries").update({ status }).eq("id", id).select("id").maybeSingle();
  if (error || !updated) return { error: "The inquiry could not be updated. It may have already been removed." };
  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
  return { success: "Inquiry status updated." };
}

export async function deleteInquiry(_state: ActionState, data: FormData): Promise<ActionState> {
  const { supabase } = await requireStaff();
  const id = field(data, "id");
  if (!uuid.test(id) || data.get("confirm") !== "on") return { error: "Confirm permanent deletion to remove this inquiry." };
  const { data: deleted, error } = await supabase.from("inquiries").delete().eq("id", id).select("id").maybeSingle();
  if (error || !deleted) return { error: "The inquiry could not be deleted. It may have already been removed." };
  revalidatePath("/admin");
  revalidatePath("/admin/inquiries");
  return { success: "Inquiry permanently deleted." };
}

export async function uploadMedia(_state: ActionState, data: FormData): Promise<ActionState> {
  const { supabase, user } = await requireStaff();
  const file = data.get("image");
  if (!(file instanceof File) || !file.size || file.size > 5 * 1024 * 1024) return { error: "Choose a JPEG, PNG or WebP image no larger than 5 MB." };
  if (data.get("rights") !== "on") return { error: "Confirm that the image is approved and licensed for use." };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const png = [137,80,78,71,13,10,26,10].every((value, index) => bytes[index] === value);
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp = String.fromCharCode(...bytes.slice(0,4)) === "RIFF" && String.fromCharCode(...bytes.slice(8,12)) === "WEBP";
  const format = png ? { extension: "png", mime: "image/png" } : jpeg ? { extension: "jpg", mime: "image/jpeg" } : webp ? { extension: "webp", mime: "image/webp" } : null;
  if (!format || file.type !== format.mime) return { error: "The file contents must match a JPEG, PNG or WebP image." };
  const base = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60) || "image";
  const path = `${user.id}/${base}-${crypto.randomUUID()}.${format.extension}`;
  const { error } = await supabase.storage.from("media").upload(path, bytes, { contentType: format.mime, cacheControl: "31536000", upsert: false });
  if (error) return { error: "The upload failed. Check that the media bucket and staff storage policies are configured." };
  const { data: uploaded } = supabase.storage.from("media").getPublicUrl(path);
  return { success: "Image uploaded. Copy its URL into the hero or social image field.", url: uploaded.publicUrl };
}
