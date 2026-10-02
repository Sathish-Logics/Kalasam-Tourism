"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveContent, uploadMedia } from "@/app/admin/actions";
import { FormFeedback, SubmitButton } from "./form-feedback";
import { contentKinds, contentPath, type AdminContent, type ContentKind } from "./types";

function MediaUpload() {
  const [state, action] = useActionState(uploadMedia, {});
  return <section className="admin-card"><h2>Media library</h2><p className="admin-muted">Upload approved photography, then paste the image URL into your content. Use descriptive filenames and optimize large photos before uploading.</p><form action={action}><label className="admin-field">Image file<input name="image" type="file" accept="image/jpeg,image/png,image/webp" required /><small>JPEG, PNG or WebP. Maximum 5 MB.</small></label><label className="admin-check"><input type="checkbox" name="rights" required />I confirm this image is licensed and approved for use.</label><SubmitButton className="secondary">Upload image</SubmitButton><FormFeedback state={state} />{state.url && <label className="admin-field">Uploaded image URL<input readOnly value={state.url} onFocus={(event) => event.target.select()} /><small>Select and copy this URL.</small></label>}</form></section>;
}

export function ContentForm({ entry, created }: { entry?: AdminContent; created?: boolean }) {
  const [state, action] = useActionState(saveContent, {});
  const [kind, setKind] = useState<ContentKind>(entry?.kind ?? "journey");
  const [published, setPublished] = useState(entry?.published ?? false);
  const [noindex, setNoindex] = useState(entry?.noindex ?? false);
  const [approved, setApproved] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({
    title: entry?.title ?? "", slug: entry?.slug ?? "", summary: entry?.summary ?? "", body: entry?.body ?? "",
    hero_image: entry?.hero_image ?? "", image_alt: entry?.image_alt ?? "", region: entry?.region ?? "", duration: entry?.duration ?? "",
    tags: entry?.tags?.join(", ") ?? "", related_slugs: entry?.related_slugs?.join(", ") ?? "", stops: entry?.stops?.join("\n") ?? "",
    seo_title: entry?.seo_title ?? "", seo_description: entry?.seo_description ?? "", canonical_url: entry?.canonical_url ?? "", social_image: entry?.social_image ?? "",
  });
  function update(name: string, value: string) { setValues((previous) => ({ ...previous, [name]: value })); }
  function input(name: string, label: string, limit: number, hint?: string, required = false, multiline = false) {
    const props = { name, value: values[name], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(name, event.target.value), maxLength: limit, required };
    return <label className="admin-field">{label}{multiline ? <textarea {...props} rows={name === "body" ? 10 : 4} /> : <input {...props} />}{hint && <small>{hint}</small>}</label>;
  }
  const previewPath = contentPath(kind, values.slug || "your-page-url");
  return <>
    {created && <p className="admin-notice admin-success" role="status">Content created successfully.</p>}
    <form action={action}>
      <input type="hidden" name="id" value={entry?.id ?? ""} />
      <section className="admin-card"><h2>The story</h2><div className="admin-grid">
        <label className="admin-field">Content type<select name={entry ? undefined : "kind"} value={kind} onChange={(event) => setKind(event.target.value as ContentKind)} disabled={!!entry}>{contentKinds.map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select><small>The content type stays fixed after creation.</small></label>
        {entry && <input type="hidden" name="kind" value={kind} />}
        {input("slug", "URL slug", 100, kind === "service" ? "Use family-ceremonies, senior-assistance, or b2b-partners." : "Lowercase words separated with hyphens. Former URLs redirect automatically after a change.", true)}
      </div>
      {input("title", kind === "testimonial" ? "Attribution / traveler name" : "Title", 160, undefined, true)}
      {input("summary", "Short introduction", 500, "A distinct, useful introduction for listings and search previews.", false, true)}
      {input("body", kind === "testimonial" ? "Client-approved quote" : "Full description", 20000, "Plain text. Separate paragraphs with a blank line. HTML is displayed as text.", false, true)}
      <div className="admin-grid">{input("region", "Region / location", 160)}{input("duration", "Duration", 100, "Optional, for example: 5 days / 4 nights. Use approved information.")}{input("tags", "Experience tags", 1000, "Separate with commas, for example: Heritage, Family, Temples.")}{input("related_slugs", "Related content slugs", 2000, "Separate journey, destination or circuit slugs with commas.")}</div>
      {kind === "circuit" && input("stops", "Circuit stops, in order", 6000, "One temple or destination per line.", false, true)}
      {kind !== "circuit" && <input type="hidden" name="stops" value={values.stops} />}
      </section>
      <section className="admin-card"><h2>Photography</h2>{input("hero_image", "Hero image URL", 2048, "Upload an image below, or use an existing /images/ path.")}{input("image_alt", "Image description (alt text)", 300, "Describe the meaningful content of the image for someone who cannot see it.")}</section>
      <section className="admin-card"><h2>Search & sharing</h2>{input("seo_title", "SEO title", 160, `${values.seo_title.length} characters. Aim for a clear title around 50–60 characters; the page title is used when empty.`)}{input("seo_description", "Search description", 320, `${values.seo_description.length} characters. Aim for a useful summary around 140–160 characters; the introduction is used when empty.`, false, true)}{input("canonical_url", "Canonical URL override", 2048, "Leave blank for this page’s own URL. Only override when it intentionally duplicates another URL on this domain.")}{input("social_image", "Social share image URL", 2048, "Optional. Use an uploaded image URL; otherwise the hero or site fallback is used.")}
        <div className="admin-preview" aria-label="Search preview"><small>{previewPath}</small><strong>{values.seo_title || values.title || "Your page title"}</strong><p>{values.seo_description || values.summary || "A useful introduction helps travelers understand what they will find on this page."}</p></div>
        <label className="admin-check"><input type="checkbox" name="noindex" checked={noindex} onChange={(event) => setNoindex(event.target.checked)} />Keep this page out of search results while its content is being completed.</label>
      </section>
      <section className="admin-card"><h2>Publication</h2><p className="admin-muted">Before publishing, check the title, useful body copy, factual claims, image rights and alt text. Use a unique search title and description. Pages marked for exclusion are omitted from the sitemap.</p><label className="admin-check"><input type="checkbox" name="approved" checked={approved} onChange={(event) => setApproved(event.target.checked)} />The client has approved this copy, factual information, image rights and any testimonial.</label><label className="admin-check"><input type="checkbox" name="published" checked={published} onChange={(event) => setPublished(event.target.checked)} />Publish this entry on the website.</label><FormFeedback state={state} /><div className="admin-row"><SubmitButton>{published ? "Save & publish" : "Save draft"}</SubmitButton><Link href="/admin/content" className="admin-button secondary">Back to content</Link>{entry?.published && kind !== "testimonial" && <Link className="admin-subtle-link" href={contentPath(entry.kind, entry.slug)} target="_blank" rel="noopener noreferrer">View published page ↗</Link>}</div></section>
    </form>
    <MediaUpload />
  </>;
}
