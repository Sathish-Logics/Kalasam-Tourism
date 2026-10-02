import Link from "next/link";
import { getSettings } from "@/lib/content";
import { isInquiryConfigured } from "@/lib/supabase/server";
import type { InquiryType } from "@/lib/types";
import { InquiryForm } from "@/components/inquiry-form";

export async function InquirySection({ type = "journey", interests = "" }: { type?: InquiryType; interests?: string }) {
  const settings = await getSettings();
  const ready = isInquiryConfigured() && Boolean(settings.privacy_text.trim() && settings.consent_text.trim() && settings.consent_version.trim());
  const whatsapp = settings.whatsapp.replace(/\D/g, "");
  if (ready) return <InquiryForm type={type} interests={interests} consentText={settings.consent_text} />;
  return <div className="empty-state inquiry-unavailable"><span className="eyebrow">Let’s stay in touch</span><h2>Online inquiries will open soon</h2><p>In the meantime, explore our journeys and keep a little space for your next adventure.</p>{(settings.email || settings.phone || whatsapp) && <div className="contact-details"><p>You can also contact the team directly:</p>{settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}{settings.phone && <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`}>{settings.phone}</a>}{whatsapp && <a className="button button-gold" href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">Chat on WhatsApp ↗</a>}</div>}<Link className="button button-outline" href="/journeys">Explore journeys →</Link></div>;
}
