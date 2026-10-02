import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Flower2, Flame, Globe2, Heart, HeartHandshake, Landmark, MapPin, Route, ShieldCheck, Sparkles, Users, Check } from "lucide-react";
import { getContent } from "@/lib/content";
import { entryPath, pageMetadata } from "@/lib/seo";
import { ClosingCTA, SectionHeading } from "@/components/public-ui";

export const metadata = pageMetadata("Sacred journeys of South India", "Explore temple heritage, spiritual journeys, family ceremonies, and thoughtfully planned travel across South India with Kalasam Tourism.", "/");
const circuitIcons = [Landmark, Flame, Flower2, Sparkles, Compass, Route];

export default async function HomePage() {
  const content = await getContent();
  const destinations = content.filter((item) => item.kind === "destination").slice(0, 3);
  const circuits = content.filter((item) => item.kind === "circuit").slice(0, 6);
  const testimonials = content.filter((item) => item.kind === "testimonial").slice(0, 3);
  const ceremony = content.find((item) => item.kind === "service" && item.slug === "family-ceremonies");
  const senior = content.find((item) => item.kind === "service" && item.slug === "senior-assistance");
  const heroImage = destinations.find((item) => item.slug === "tamil-nadu")?.hero_image || "/images/thanjavur.jpg";
  return <>
    <section className="home-hero">
      <Image src={heroImage} alt="Brihadeeswarar Temple at sunset in Thanjavur" fill priority sizes="100vw" className="cover-image hero-photo" />
      <div className="hero-shade" /><div className="hero-border" aria-hidden="true" />
      <div className="container hero-content">
        <p className="eyebrow"><span /> Spiritual journeys <b>·</b> Heritage <b>·</b> Tradition</p>
        <h1>Journeys beyond<br /><em>destinations.</em></h1>
        <p className="hero-description">Some journeys take you places.<br />Ours bring you closer to what matters.</p>
        <div className="hero-actions"><Link href="/journeys" className="button button-gold">Explore journeys <ArrowRight size={17} /></Link><Link href="/plan-my-journey" className="button button-glass">Plan my journey</Link></div>
        <div className="hero-note"><Flower2 size={21} strokeWidth={1.3} /><span>Rooted in tradition. Crafted around you.</span></div>
      </div>
      <div className="container hero-bottom"><a href="#destinations"><span className="scroll-icon">↓</span> A world of meaning awaits</a><span className="hero-location"><MapPin size={14} /> Thanjavur, Tamil Nadu</span></div>
    </section>

    <section id="destinations" className="section destinations-section"><div className="container">
      <SectionHeading eyebrow="Discover the South" title="Sacred journeys of South India" description="From timeless temple towns to tranquil backwaters, find a place that speaks to you." />
      <div className="destination-grid">{destinations.map((destination, index) => <Link href={entryPath(destination)} key={destination.id} className="destination-card">
        <Image src={destination.hero_image} alt={destination.image_alt} fill sizes="(max-width: 700px) 100vw, 33vw" className="cover-image" /><span className="destination-number">0{index + 1} / EXPLORE</span>
        <div><h3>{destination.title}</h3><p>{destination.summary}</p><span className="destination-explore">Discover {destination.title} <ArrowRight size={17} /></span></div>
      </Link>)}</div>
      <div className="section-footer"><Link href="/destinations" className="text-link">All destinations <ArrowRight size={16} /></Link></div>
    </div></section>

    <section className="section circuit-section"><div className="circuit-watermark" aria-hidden="true"><Landmark size={380} strokeWidth={0.3} /></div><div className="container">
      <SectionHeading eyebrow="Paths of faith" title="Walk through centuries of devotion" description="Follow the sacred trails that have inspired generations." />
      <div className="circuit-grid">{circuits.map((circuit, index) => { const Icon = circuitIcons[index % circuitIcons.length]; return <Link href={entryPath(circuit)} className="circuit-card" key={circuit.id}><Icon size={34} strokeWidth={1} /><h3>{circuit.title}</h3><p>{circuit.summary}</p><ArrowRight size={15} className="circuit-arrow" /></Link>; })}</div>
      <div className="section-footer"><Link href="/temple-circuits" className="button button-gold">Explore temple circuits <ArrowRight size={16} /></Link></div>
    </div></section>

    <section className="section international-section"><div className="container international-inner">
      <div><p className="eyebrow">Across borders. Closer to your roots.</p><h2>Your spiritual journey<br />begins here.</h2><p>From Malaysia, Singapore, Sri Lanka, and beyond—<br className="desktop-only" />let South India be a meaningful part of your story.</p><Link className="text-link" href="/plan-my-journey">Plan your South India journey <ArrowRight size={18} /></Link></div>
      <div className="country-cards">{[["🇲🇾", "Malaysia"], ["🇸🇬", "Singapore"], ["🇱🇰", "Sri Lanka"]].map(([flag, country]) => <Link key={country} href={`/plan-my-journey?country=${encodeURIComponent(country)}`} className="country-card"><Globe2 className="country-globe" size={38} strokeWidth={0.7} /><span className="country-flag" role="img" aria-label={`${country} flag`}>{flag}</span><h3>{country}</h3><span>Plan your visit <ArrowRight size={12} /></span></Link>)}</div>
    </div></section>

    <section className="personal-section"><div className="container personal-inner"><div className="personal-symbol"><Flower2 size={72} strokeWidth={0.7} /></div><div><p className="eyebrow">Made personal</p><h2>Your journey. Your traditions. Your way.</h2><p>Tell us where you dream of going. We’ll help shape the journey around you.</p></div><Link href="/plan-my-journey" className="button button-gold">Create my journey <ArrowRight size={16} /></Link></div></section>

    {(ceremony || senior) && <section className="section services-section"><div className="container">
      <SectionHeading eyebrow="For the moments that matter" title="Thoughtfully planned. Deeply personal." />
      {ceremony && <article className="feature-row"><div className="feature-photo"><Image src={ceremony.hero_image} alt={ceremony.image_alt} fill sizes="(max-width: 700px) 100vw, 50vw" className="cover-image" /><div className="image-label"><Flower2 size={19} /> Rooted in family. Rich in tradition.</div></div><div className="feature-copy"><p className="eyebrow">Family & tradition</p><h2>{ceremony.title}</h2><p>{ceremony.summary}</p><ul className="feature-list">{ceremony.tags.map((tag) => <li key={tag}><Check size={16} />{tag}</li>)}</ul><Link href="/family-ceremonies" className="button button-bronze">Explore family ceremonies <ArrowRight size={16} /></Link></div></article>}
      {senior && <article className="feature-row feature-row-reverse"><div className="feature-photo"><Image src={senior.hero_image} alt={senior.image_alt} fill sizes="(max-width: 700px) 100vw, 50vw" className="cover-image" /><div className="image-label"><Heart size={19} /> A little care makes a world of difference.</div></div><div className="feature-copy"><p className="eyebrow">Care at every step</p><h2>{senior.title}</h2><p>{senior.summary}</p><div className="care-features"><span><Route size={23} />Considered routes</span><span><Users size={23} />Family comfort</span><span><HeartHandshake size={23} />Personal assistance</span></div><Link href="/senior-assistance" className="text-link">Explore senior assistance <ArrowRight size={16} /></Link></div></article>}
    </div></section>}

    <section className="section values-section"><div className="container"><SectionHeading eyebrow="A little more than travel" title="The Kalasam way" description="Journeys with purpose, shaped with care." />
      <div className="values-grid">{[[Flower2, "Authentic experiences", "Connect with the places and traditions that inspire you."], [Compass, "Thoughtful planning", "Make room for the moments you came to find."], [Users, "Family togetherness", "Bring generations together through shared experiences."], [HeartHandshake, "A personal connection", "Start with a conversation. Build a journey around you."]].map(([Icon, title, text]) => { const ValueIcon = Icon as typeof Flower2; return <div className="value-item" key={title as string}><ValueIcon size={30} strokeWidth={1} /><h3>{title as string}</h3><p>{text as string}</p></div>; })}</div>
    </div></section>
    {testimonials.length > 0 && <section className="section testimonials-section"><div className="container"><SectionHeading eyebrow="Travel stories" title="Journeys that stay with you" /><div className="grid-3">{testimonials.map((item) => <figure className="testimonial" key={item.id}><span>“</span><blockquote>{item.body}</blockquote><figcaption>{item.title}{item.region && <small>{item.region}</small>}</figcaption></figure>)}</div></div></section>}
    <div className="trust-strip container"><ShieldCheck size={18} /><p>A thoughtful journey starts with a conversation.</p><Link href="/contact">Talk to our team <ArrowRight size={14} /></Link></div>
    <ClosingCTA />
  </>;
}
