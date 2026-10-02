import Link from "next/link";
import { Home, Compass, MapPin, MessageCircle, ArrowRight, Mail, Phone, Camera, Users } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Brand } from "@/components/brand";
import { getSettings } from "@/lib/content";
import { jsonLd, siteIndexable, siteUrl } from "@/lib/seo";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const phone = settings.whatsapp.replace(/[\s()-]/g, "");
  const whatsapp = /^\+?[1-9]\d{6,14}$/.test(phone) ? `https://wa.me/${phone.replace(/\D/g, "")}` : "";
  return <>
    <a className="skip-link" href="#main-content">Skip to content</a><SiteHeader />
    <main id="main-content">{children}</main>
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand"><Link href="/" aria-label="Kalasam Tourism home"><Brand /></Link><p>Sacred journeys.<br />Timeless traditions.</p><div className="social-links">{settings.instagram && <a href={settings.instagram} aria-label="Instagram" rel="noopener noreferrer"><Camera size={18} /></a>}{settings.facebook && <a href={settings.facebook} aria-label="Facebook" rel="noopener noreferrer"><Users size={18} /></a>}</div></div>
        <div><h2>Explore</h2><Link href="/journeys">Our journeys</Link><Link href="/destinations">Destinations</Link><Link href="/temple-circuits">Temple circuits</Link><Link href="/family-ceremonies">Family ceremonies</Link><Link href="/senior-assistance">Senior assistance</Link></div>
        <div><h2>Plan together</h2><Link href="/plan-my-journey">Create your itinerary</Link><Link href="/b2b-partners">Become a partner</Link><Link href="/contact">Contact our team</Link><Link href="/privacy">Privacy policy</Link><Link href="/image-credits">Image credits</Link></div>
        <div className="footer-contact"><h2>Let’s begin a conversation</h2><p>Your next chapter in South India starts with a little inspiration.</p>{settings.email && <a href={`mailto:${settings.email}`}><Mail size={14} />{settings.email}</a>}{settings.phone && <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}><Phone size={14} />{settings.phone}</a>}{settings.address && <p><MapPin size={14} />{settings.address}</p>}<Link href="/plan-my-journey" className="footer-plan">Plan my journey <ArrowRight size={15} /></Link></div>
      </div>
      <div className="container footer-bottom"><p>© {new Date().getFullYear()} {settings.brand_name || "Kalasam Tourism"}. All rights reserved.</p><div><Link href="/contact">Contact</Link><Link href="/admin">Staff access</Link></div></div>
    </footer>
    {whatsapp && <a className="whatsapp-float" href={whatsapp} aria-label="Chat with Kalasam Tourism on WhatsApp" target="_blank" rel="noopener noreferrer"><MessageCircle size={27} /></a>}
    <nav className="mobile-bottom-nav" aria-label="Quick navigation"><Link href="/"><Home size={19} />Home</Link><Link href="/journeys"><Compass size={19} />Journeys</Link><Link href="/destinations"><MapPin size={19} />Destinations</Link>{whatsapp ? <a href={whatsapp}><MessageCircle size={19} />WhatsApp</a> : <Link href="/plan-my-journey"><MessageCircle size={19} />Plan a trip</Link>}</nav>
    {siteIndexable && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ "@context": "https://schema.org", "@type": "Organization", name: settings.brand_name, url: siteUrl, ...(settings.email ? { email: settings.email } : {}), ...(settings.phone ? { telephone: settings.phone } : {}), sameAs: [settings.instagram, settings.facebook].filter(Boolean) }) }} />}
  </>;
}
