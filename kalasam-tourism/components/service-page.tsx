import { notFound } from "next/navigation";
import { getEntry } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import type { InquiryType } from "@/lib/types";
import { Breadcrumbs, PageHero, SectionHeading } from "@/components/public-ui";
import { ContentBody } from "@/components/content-detail";
import { InquirySection } from "@/components/inquiry-section";

type ServiceSlug = "family-ceremonies" | "senior-assistance" | "b2b-partners";
const services: Record<ServiceSlug, { eyebrow: string; type: InquiryType; formTitle: string; formDescription: string }> = {
  "family-ceremonies": { eyebrow: "Bring your traditions together", type: "ceremony", formTitle: "Tell us about your celebration", formDescription: "Share the occasion, your preferred destination, and who will be joining you." },
  "senior-assistance": { eyebrow: "At a pace that feels right", type: "senior", formTitle: "Let’s plan around your comfort", formDescription: "Tell us about your journey and any practical arrangements you would like to discuss." },
  "b2b-partners": { eyebrow: "Better journeys, together", type: "partner", formTitle: "Start a partnership conversation", formDescription: "Tell us about your business, your guests, and the experiences you would like to create." },
};

export async function serviceMetadata(slug: ServiceSlug) {
  const entry = await getEntry("service", slug);
  if (!entry) notFound();
  return pageMetadata(entry.seo_title || entry.title, entry.seo_description || entry.summary, `/${slug}`, entry.social_image || entry.hero_image || undefined, entry.noindex, entry.canonical_url);
}

export async function ServicePage({ slug }: { slug: ServiceSlug }) {
  const entry = await getEntry("service", slug);
  if (!entry) notFound();
  const service = services[slug];
  return <>
    <PageHero eyebrow={service.eyebrow} title={entry.title} description={entry.summary} image={entry.hero_image} imageAlt={entry.image_alt} />
    <div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: entry.title }]} /></div>
    <section className="section container"><SectionHeading eyebrow="Every detail matters" title={slug === "b2b-partners" ? "Connect with Kalasam" : "For the moments that matter"} /><ContentBody body={entry.body} />{entry.tags.length > 0 && <div className="service-benefits">{entry.tags.map((tag, index) => <div key={tag} className="service-benefit"><span className="eyebrow">{String(index + 1).padStart(2, "0")}</span><h3>{tag}</h3></div>)}</div>}</section>
    <section className="section container inquiry-layout" id="inquire"><div><p className="eyebrow">Let’s begin</p><h2>{service.formTitle}</h2><p>{service.formDescription}</p><ol className="step-list"><li>Share what you have in mind.</li><li>Discuss the details with the team.</li><li>Shape a plan around your preferences.</li></ol></div><div className="card"><InquirySection type={service.type} /></div></section>
  </>;
}
