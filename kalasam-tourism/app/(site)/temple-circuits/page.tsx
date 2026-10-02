import { getContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, ClosingCTA, EntryCard, PageHero, SectionHeading } from "@/components/public-ui";

export const metadata = pageMetadata("South India Temple Circuits", "Discover temple circuits in South India. Explore sacred places, heritage routes, and pilgrimage ideas to shape your personal journey.", "/temple-circuits");

export default async function CircuitsPage() {
  const entries = await getContent("circuit");
  return <>
    <PageHero eyebrow="Sacred paths. Timeless stories." title="Walk through centuries of devotion" description="Discover temple circuits that bring together sacred places, enduring traditions, and the joy of the journey." image={entries[0]?.hero_image} imageAlt={entries[0]?.image_alt} />
    <div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Temple circuits" }]} /></div>
    <section className="section container"><SectionHeading eyebrow="Follow your devotion" title="Find your sacred path" description="Explore a circuit, then tell us how you would like to make the journey your own." />{entries.length ? <div className="grid-3">{entries.map((entry) => <EntryCard key={entry.id} entry={entry} />)}</div> : <div className="empty-state"><h3>Temple circuits are being prepared</h3><p>You can still share your temple interests when planning a custom journey.</p></div>}</section>
    <ClosingCTA />
  </>;
}
