import { getContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, ClosingCTA, EntryCard, PageHero, SectionHeading } from "@/components/public-ui";

export const metadata = pageMetadata("South India Destinations", "Explore Tamil Nadu, Kerala and Karnataka, and find inspiration for a personal journey through South India’s temple heritage and landscapes.", "/destinations");

export default async function DestinationsPage() {
  const entries = await getContent("destination");
  return <>
    <PageHero eyebrow="Places with a story" title="Our destinations" description="Temple towns. Quiet backwaters. Living traditions. Find the places that speak to you." image={entries[0]?.hero_image} imageAlt={entries[0]?.image_alt} />
    <div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Destinations" }]} /></div>
    <section className="section container"><SectionHeading eyebrow="The heart of South India" title="A different story in every destination" description="Choose a region and explore the journeys, sacred spaces, and cultural experiences within it." />{entries.length ? <div className="grid-3">{entries.map((entry) => <EntryCard key={entry.id} entry={entry} />)}</div> : <div className="empty-state"><h3>More places to discover, soon</h3><p>Share the destinations on your mind through our journey planning page.</p></div>}</section>
    <ClosingCTA />
  </>;
}
