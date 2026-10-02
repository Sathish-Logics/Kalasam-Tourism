import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, MapPin, Sparkles } from "lucide-react";
import type { ContentEntry } from "@/lib/types";
import { entryPath, jsonLd, siteUrl } from "@/lib/seo";

export function SectionHeading({ eyebrow, title, description, align = "center" }: { eyebrow?: string; title: string; description?: string; align?: "center" | "left" }) {
  return <div className={`section-heading ${align === "left" ? "align-left" : ""}`}>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2><span className="heading-ornament" aria-hidden="true">✦</span>{description && <p>{description}</p>}</div>;
}

export function PageHero({ eyebrow, title, description, image, imageAlt = "" }: { eyebrow: string; title: string; description?: string; image?: string; imageAlt?: string }) {
  return <section className={`page-hero ${image ? "with-image" : ""}`}>{image && <Image src={image} alt={imageAlt} fill preload sizes="100vw" className="cover-image" />}<div className="container page-hero-inner"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="page-hero-description">{description}</p>}</div></section>;
}

export function EntryCard({ entry }: { entry: ContentEntry }) {
  const action = entry.kind === "destination" ? "Discover destination" : entry.kind === "circuit" ? "Explore temple circuit" : "Explore journey";
  return <Link className="entry-card" href={entryPath(entry)}><div className="entry-image"><Image src={entry.hero_image || "/images/thanjavur.jpg"} alt={entry.image_alt || entry.title} fill sizes="(max-width: 700px) 100vw, (max-width: 1024px) 50vw, 33vw" className="cover-image" />{entry.region && <span className="entry-location"><MapPin size={12} />{entry.region}</span>}</div><div className="entry-copy"><h3>{entry.title}</h3><p>{entry.summary}</p><span className="text-link">{action} <ArrowRight size={16} /></span></div></Link>;
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  const full = items[0]?.href === "/" ? items : [{ label: "Home", href: "/" }, ...items];
  return <><nav aria-label="Breadcrumb" className="breadcrumbs"><ol>{full.map((item, i) => <li key={`${item.label}-${i}`}>{i > 0 && <ChevronRight size={12} />}{item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}</li>)}</ol></nav><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: full.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.label, ...(item.href ? { item: `${siteUrl}${item.href}` } : {}) })) }) }} /></>;
}

export function ClosingCTA() {
  return <section className="closing-cta"><div className="container"><Sparkles size={25} strokeWidth={1} /><p className="eyebrow">A journey that feels like yours</p><h2>Your sacred journey awaits.</h2><p>Tell us what brings you here. We’ll help you find your way.</p><Link className="button button-gold" href="/plan-my-journey">Plan my journey <ArrowRight size={16} /></Link></div></section>;
}
