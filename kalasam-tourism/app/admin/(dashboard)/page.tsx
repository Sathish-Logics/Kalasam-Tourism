import Link from "next/link";
import { requireStaff } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const { supabase } = await requireStaff();
  const [inquiries, published, failed] = await Promise.all([
    supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("content_entries").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("notification_status", "failed"),
  ]);
  return <><p className="admin-eyebrow">Your workspace</p><h1>A little care. A better journey.</h1><p className="admin-muted">Keep the website fresh and help the next traveler find their way.</p>
    {(inquiries.error || published.error || failed.error) && <p className="admin-notice admin-error" role="alert">Dashboard information could not be loaded. Check the database connection and migration setup.</p>}
    <div className="admin-stats" style={{ marginTop: 30 }}><Link href="/admin/inquiries?status=new" className="admin-card"><span className="admin-stat">{inquiries.count ?? "—"}</span><p>New inquiries</p></Link><Link href="/admin/content" className="admin-card"><span className="admin-stat">{published.count ?? "—"}</span><p>Published entries</p></Link><Link href="/admin/inquiries?notification=failed" className="admin-card"><span className="admin-stat">{failed.count ?? "—"}</span><p>Email notifications needing attention</p></Link></div>
    <div className="admin-grid"><section className="admin-card"><h2>Make every page useful.</h2><p className="admin-muted">Add client-approved destination information, clear descriptions and licensed photography. Each page has its own SEO preview and publication checklist.</p><Link href="/admin/content/new" className="admin-button">Create content</Link></section><section className="admin-card"><h2>Follow up with care.</h2><p className="admin-muted">Your inquiry inbox keeps every received request, including those with failed email notifications. Update the status as your team follows up.</p><Link href="/admin/inquiries" className="admin-button secondary">Open inquiries</Link></section></div>
    <p className="admin-small admin-muted">Inquiries are retained for 12 months. You can delete them earlier from the inquiry inbox. <Link href="/admin/password">Change your password</Link>.</p>
  </>;
}
