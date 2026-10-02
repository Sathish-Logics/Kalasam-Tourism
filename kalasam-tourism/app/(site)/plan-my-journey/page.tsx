import Link from "next/link";
import { getContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, PageHero } from "@/components/public-ui";
import { InquirySection } from "@/components/inquiry-section";

export const metadata = pageMetadata("Plan Your South India Journey", "Tell Kalasam Tourism about your destinations, travel dates, family, and interests. Start planning a personal spiritual or cultural journey through South India.", "/plan-my-journey");

type Props = { searchParams: Promise<{ interest?: string | string[] }> };

export default async function PlanMyJourneyPage({ searchParams }: Props) {
  const [query, destinations] = await Promise.all([searchParams, getContent("destination")]);
  const interest = typeof query.interest === "string" ? query.interest.slice(0, 100) : "";
  return <>
    <PageHero eyebrow="Your journey. Your traditions. Your way." title="Let’s plan something meaningful" description="A family gathering, a sacred pilgrimage, a place you have always wanted to see. Tell us where your heart wants to go." image={destinations[0]?.hero_image} imageAlt={destinations[0]?.image_alt} />
    <div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Plan my journey" }]} /></div>
    <section className="section container inquiry-layout">
      <aside><p className="eyebrow">Made around you</p><h2>Every great journey starts with a conversation</h2><p>Share a little about the places, experiences, and people at the heart of your trip. It is fine if you are still finding your way.</p><ol className="step-list"><li><strong>Tell us your ideas</strong><p>Choose your destinations or leave room for inspiration.</p></li><li><strong>Talk through the details</strong><p>Discuss your dates, companions, interests, and preferred pace.</p></li><li><strong>Shape your journey</strong><p>Work with the team on a plan that brings your ideas together.</p></li></ol><p>Looking for inspiration first? <Link href="/journeys">Explore our journeys →</Link></p></aside>
      <div className="card"><InquirySection interests={interest} /></div>
    </section>
  </>;
}
