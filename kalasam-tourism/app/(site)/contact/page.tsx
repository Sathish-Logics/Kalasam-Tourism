import { getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs, PageHero } from "@/components/public-ui";
import { InquirySection } from "@/components/inquiry-section";

export const metadata = pageMetadata("Contact Kalasam Tourism", "Connect with Kalasam Tourism about South India journeys, temple visits, family ceremonies, travel preferences, and partnership inquiries.", "/contact");

export default async function ContactPage() {
  const settings = await getSettings();
  const whatsapp = settings.whatsapp.replace(/\D/g, "");
  return <>
    <PageHero eyebrow="A conversation away" title="We’d love to hear from you" description="Have a journey in mind or a question before you begin? There is a place for every story." />
    <div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} /></div>
    <section className="section container inquiry-layout">
      <div><p className="eyebrow">Get in touch</p><h2>Your next journey starts here</h2><p>Share your questions, plans, or ideas with the Kalasam team.</p><dl className="contact-details">{settings.email && <div><dt>Email us</dt><dd><a href={`mailto:${settings.email}`}>{settings.email}</a></dd></div>}{settings.phone && <div><dt>Call us</dt><dd><a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}>{settings.phone}</a></dd></div>}{settings.address && <div><dt>Find us</dt><dd>{settings.address}</dd></div>}</dl>{whatsapp && <a className="button button-gold" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">Start a WhatsApp conversation ↗</a>}<div className="section"><h3>Travelling to South India?</h3><p>Whether you are coming from India, Malaysia, Singapore, Sri Lanka, or further afield, start by telling us what you have in mind.</p></div></div>
      <div className="card"><InquirySection type="contact" /></div>
    </section>
  </>;
}
