import Link from "next/link";
import { requireStaff } from "@/lib/supabase/server";
import type { Inquiry } from "@/lib/types";
import { DeleteInquiryForm, InquiryStatusForm } from "@/components/admin/inquiry-forms";

const statuses = ["new", "contacted", "qualified", "closed"] as const;
const types = ["journey", "ceremony", "senior", "partner", "contact"] as const;

export default async function InquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string; type?: string; notification?: string }> }) {
  const { supabase } = await requireStaff();
  const filters = await searchParams;
  let query = supabase.from("inquiries").select("*").order("created_at", { ascending: false }).limit(250);
  if (filters.status && (statuses as readonly string[]).includes(filters.status)) query = query.eq("status", filters.status);
  if (filters.type && (types as readonly string[]).includes(filters.type)) query = query.eq("type", filters.type);
  if (filters.notification === "failed") query = query.in("notification_status", ["failed", "pending"]);
  const { data, error } = await query;
  const inquiries = (data || []) as Inquiry[];
  return <>
    <div className="admin-toolbar"><div><p className="admin-eyebrow">Traveler conversations</p><h1>Inquiries</h1><p className="admin-muted">Every inquiry is kept here, even when its email notification needs attention.</p></div><Link className="admin-button secondary" href="/admin">Dashboard</Link></div>
    <form className="admin-filters">
      <label className="admin-field">Status<select name="status" defaultValue={filters.status || ""}><option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
      <label className="admin-field">Request type<select name="type" defaultValue={filters.type || ""}><option value="">All types</option>{types.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
      <label className="admin-check"><input type="checkbox" name="notification" value="failed" defaultChecked={filters.notification === "failed"} /> Show email notices needing attention</label>
      <button type="submit" className="admin-button secondary">Apply filters</button>
      <Link className="admin-subtle-link" href="/admin/inquiries">Clear</Link>
    </form>
    {error ? <p className="admin-notice admin-error" role="alert">Inquiries could not be loaded. Check the database connection and staff access.</p> : inquiries.length === 0 ? <section className="admin-card"><h2>No inquiries in this view</h2><p className="admin-muted">New visitor requests will appear here after inquiry storage is configured.</p></section> : <section aria-label="Visitor inquiries" className="admin-card">
      {inquiries.map((item) => <article key={item.id} className="admin-inquiry">
        <details>
          <summary><span><strong>{item.name}</strong><span className="admin-small admin-muted"> · {item.type} · {new Date(item.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}</span></span><span className="admin-row"><span className="admin-badge">{item.status}</span><span className={`admin-badge ${item.notification_status === "sent" ? "live" : ""}`}>Email {item.notification_status}</span></span></summary>
          <div className="admin-inquiry-details">
            <dl className="admin-dl"><dt>Email</dt><dd>{item.email || "Not supplied"}</dd><dt>Phone</dt><dd>{item.phone || "Not supplied"}</dd><dt>Origin</dt><dd>{item.country}</dd><dt>Travel window</dt><dd>{item.travel_window || "Flexible / not supplied"}</dd><dt>Travelers</dt><dd>{item.traveler_count ?? "Not supplied"}</dd><dt>Interests</dt><dd>{item.interests.join(", ") || "Not supplied"}</dd><dt>Source page</dt><dd>{item.source_path}</dd><dt>Consent recorded</dt><dd>{new Date(item.consent_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })} · version {item.consent_version}</dd></dl>
            <h3>Message</h3><p className="admin-message">{item.message}</p>
            {item.notification_status !== "sent" && <p className="admin-notice admin-error">Email notification {item.notification_status}. This inquiry is saved in the dashboard; please follow up from here.</p>}
            <div className="admin-grid"><section><h3>Follow-up status</h3><InquiryStatusForm id={item.id} current={item.status} /></section><section><h3>Delete inquiry</h3><p className="admin-small admin-muted">This permanently removes the inquiry record.</p><DeleteInquiryForm id={item.id} /></section></div>
          </div>
        </details>
      </article>)}
      {inquiries.length === 250 && <p className="admin-notice">Showing the latest 250 inquiries. Apply a filter to narrow this list.</p>}
    </section>}
  </>;
}
