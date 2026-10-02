import { getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/public-ui";
import { ContentBody } from "@/components/content-detail";

export const metadata = pageMetadata("Privacy Notice", "Read how information shared with Kalasam Tourism is used when you contact the team or submit a travel inquiry.", "/privacy", undefined, true);

export default async function PrivacyPage() {
  const settings = await getSettings();
  return <div className="container"><Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy notice" }]} /><section className="section page-intro"><p className="eyebrow">Your information</p><h1>Privacy notice</h1>{settings.privacy_text.trim() ? <ContentBody body={settings.privacy_text} /> : <div className="prose"><p>Our privacy notice is being prepared. Online inquiry forms will be available once the notice is published.</p>{settings.email && <p>For privacy questions, contact <a href={`mailto:${settings.email}`}>{settings.email}</a>.</p>}</div>}</section></div>;
}
