import Link from "next/link";
import { getContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, ClosingCTA, EntryCard, PageHero, SectionHeading } from "@/components/public-ui";

export const metadata = pageMetadata("Spiritual Journeys in South India", "Explore South Indian temple journeys, cultural escapes, and pilgrimage ideas. Find inspiration for a trip shaped around your family and traditions.", "/journeys");

type Props = { searchParams: Promise<{ region?: string | string[]; interest?: string | string[] }> };

export default async function JourneysPage({ searchParams }: Props) {
  const [entries, query] = await Promise.all([getContent("journey"), searchParams]);
  const regions = [...new Set(entries.map((entry) => entry.region).filter(Boolean))].sort();
  const interests = [...new Set(entries.flatMap((entry) => entry.tags))].sort();
  const region = typeof query.region === "string" && regions.includes(query.region) ? query.region : "";
  const interest = typeof query.interest === "string" && interests.includes(query.interest) ? query.interest : "";
  const results = entries.filter((entry) => (!region || entry.region === region) && (!interest || entry.tags.includes(interest)));
  return <>
    <PageHero eyebrow="Travel with meaning" title="Spiritual journeys" description="Let your next journey lead you closer to the places, people, and traditions that matter." image={entries[0]?.hero_image} imageAlt={entries[0]?.image_alt} />
    <div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Journeys" }]} /></div>
    <section className="section container">
      <form action="/journeys" method="get" className="filter-form" aria-label="Filter journeys">
        <div className="field"><label htmlFor="journey-region">Destination</label><select className="input" id="journey-region" name="region" defaultValue={region}><option value="">All destinations</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></div>
        <div className="field"><label htmlFor="journey-interest">Your interests</label><select className="input" id="journey-interest" name="interest" defaultValue={interest}><option value="">All experiences</option>{interests.map((item) => <option key={item}>{item}</option>)}</select></div>
        <button type="submit" className="button button-gold">Find my journey <span aria-hidden="true">→</span></button>
      </form>
      <SectionHeading eyebrow="Choose your next chapter" title={region ? `Journeys through ${region}` : "Journeys to inspire you"} description="A place to begin. Every journey starts with what is meaningful to you." align="left" />
      {(region || interest) && <p className="results-count">{results.length} {results.length === 1 ? "journey" : "journeys"} found · <Link href="/journeys">Clear filters</Link></p>}
      {results.length ? <div className="grid-3">{results.map((entry) => <EntryCard key={entry.id} entry={entry} />)}</div> : <div className="empty-state"><h3>Your journey can start here</h3><p>We don’t have a published journey matching these preferences yet.</p><Link className="button button-gold" href="/plan-my-journey">Plan a custom journey →</Link></div>}
    </section>
    <ClosingCTA />
  </>;
}
