import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getContent, getEntry, getSlugRedirect } from "@/lib/content";
import type { ContentEntry } from "@/lib/types";
import { entryPath, pageMetadata } from "@/lib/seo";
import { Breadcrumbs, ClosingCTA, EntryCard, PageHero, SectionHeading } from "@/components/public-ui";

type DetailKind = "journey" | "destination" | "circuit";

const labels: Record<DetailKind, { plural: string; eyebrow: string; path: string }> = {
  journey: { plural: "Journeys", eyebrow: "A journey to remember", path: "/journeys" },
  destination: { plural: "Destinations", eyebrow: "Discover South India", path: "/destinations" },
  circuit: { plural: "Temple circuits", eyebrow: "A path of devotion", path: "/temple-circuits" },
};

export async function resolveDetail(kind: DetailKind, slug: string) {
  const entry = await getEntry(kind, slug);
  if (entry) return entry;
  const path = `${labels[kind].path}/${slug}`;
  const redirect = await getSlugRedirect(path);
  if (redirect && redirect !== path) permanentRedirect(redirect);
  notFound();
}

export async function detailMetadata(kind: DetailKind, slug: string) {
  const entry = await resolveDetail(kind, slug);
  return pageMetadata(
    entry.seo_title || entry.title,
    entry.seo_description || entry.summary,
    entryPath(entry),
    entry.social_image || entry.hero_image || undefined,
    entry.noindex,
    entry.canonical_url,
  );
}

export function ContentBody({ body }: { body: string }) {
  return <div className="prose">{body.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>;
}

export async function ContentDetail({ entry, kind }: { entry: ContentEntry; kind: DetailKind }) {
  const all = await getContent();
  const related = all.filter((candidate) => candidate.id !== entry.id && ["journey", "destination", "circuit"].includes(candidate.kind) && entry.related_slugs.includes(candidate.slug)).slice(0, 3);
  const label = labels[kind];
  return (
    <>
      <PageHero eyebrow={label.eyebrow} title={entry.title} description={entry.summary} image={entry.hero_image} imageAlt={entry.image_alt} />
      <div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: label.plural, href: label.path }, { label: entry.title }]} /></div>
      <section className="section container detail-layout">
        <article>
          <p className="eyebrow">The experience</p>
          <h2>A little closer to the journey</h2>
          <ContentBody body={entry.body} />
          {entry.tags.length > 0 && <ul className="tag-list" aria-label="Journey interests">{entry.tags.map((tag) => <li className="tag" key={tag}>{tag}</li>)}</ul>}
          {entry.stops.length > 0 && <div className="section"><h2>Along the way</h2><ol className="itinerary-list">{entry.stops.map((stop, index) => <li key={`${index}-${stop}`}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><h3>{stop}</h3><p>Include this stop in your journey request.</p></div></li>)}</ol></div>}
        </article>
        <aside className="detail-sidebar card">
          <p className="eyebrow">Your journey, your way</p>
          <h2>Make it personal</h2>
          <p>Tell us what matters to you, who is travelling, and the places you would love to see.</p>
          {(entry.region || entry.duration) && <dl className="detail-facts">{entry.region && <div><dt>Region</dt><dd>{entry.region}</dd></div>}{entry.duration && <div><dt>Suggested duration</dt><dd>{entry.duration}</dd></div>}</dl>}
          <Link className="button button-gold" href={`/plan-my-journey?interest=${encodeURIComponent(entry.title)}`}>Plan this journey <span aria-hidden="true">↗</span></Link>
          <p className="form-note">Share your preferences to start a conversation about your trip.</p>
        </aside>
      </section>
      {related.length > 0 && <section className="section container"><SectionHeading eyebrow="Keep exploring" title="There’s more to discover" /><div className="grid-3">{related.map((item) => <EntryCard key={item.id} entry={item} />)}</div></section>}
      <ClosingCTA />
    </>
  );
}
