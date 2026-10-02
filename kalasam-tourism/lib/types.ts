export const contentKinds = ["destination", "journey", "circuit", "service", "testimonial"] as const;
export type ContentKind = (typeof contentKinds)[number];

export type ContentEntry = {
  id: string;
  kind: ContentKind;
  slug: string;
  title: string;
  summary: string;
  body: string;
  hero_image: string;
  image_alt: string;
  region: string;
  duration: string;
  tags: string[];
  related_slugs: string[];
  stops: string[];
  published: boolean;
  seo_title: string;
  seo_description: string;
  canonical_url: string;
  social_image: string;
  noindex: boolean;
  updated_at: string;
};

export type SiteSettings = {
  brand_name: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  instagram: string;
  facebook: string;
  privacy_text: string;
  consent_text: string;
  consent_version: string;
};

export const inquiryTypes = ["journey", "ceremony", "senior", "partner", "contact"] as const;
export const inquiryStatuses = ["new", "contacted", "qualified", "closed"] as const;
export type InquiryType = (typeof inquiryTypes)[number];
export type InquiryStatus = (typeof inquiryStatuses)[number];
export type Inquiry = {
  id: string;
  type: InquiryType;
  name: string;
  email: string;
  phone: string;
  country: string;
  travel_window: string;
  traveler_count: number | null;
  interests: string[];
  message: string;
  consent_at: string;
  consent_version: string;
  source_path: string;
  status: InquiryStatus;
  notification_status: "pending" | "sent" | "failed";
  notification_error: string;
  created_at: string;
  updated_at: string;
};
