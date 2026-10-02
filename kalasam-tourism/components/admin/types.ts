export type ActionState = { error?: string; success?: string; url?: string };

export const contentKinds = ["destination", "journey", "circuit", "service", "testimonial"] as const;
export type ContentKind = (typeof contentKinds)[number];
export const inquiryStatuses = ["new", "contacted", "qualified", "closed"] as const;
export const inquiryTypes = ["journey", "ceremony", "senior", "partner", "contact"] as const;

export type AdminContent = {
  id: string; kind: ContentKind; slug: string; title: string; summary: string; body: string;
  hero_image: string; image_alt: string; region: string; duration: string; tags: string[];
  related_slugs: string[]; stops: string[]; published: boolean; seo_title: string;
  seo_description: string; canonical_url: string; social_image: string; noindex: boolean; updated_at: string;
};

export type AdminSettings = {
  brand_name: string; email: string; phone: string; whatsapp: string; address: string;
  instagram: string; facebook: string; privacy_text: string; consent_text: string; consent_version: string;
};

export function contentPath(kind: ContentKind, slug: string) {
  const bases = { destination: "/destinations/", journey: "/journeys/", circuit: "/temple-circuits/", service: "/", testimonial: "" };
  return kind === "testimonial" ? "/" : `${bases[kind]}${slug}`;
}
