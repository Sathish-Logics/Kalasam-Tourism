import Link from "next/link";
import { requireStaff } from "@/lib/supabase/server";
import { contentKinds, type AdminContent } from "@/components/admin/types";

export default async function ContentPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { supabase } = await requireStaff();
  const { kind } = await searchParams;
  let query = supabase.from("content_entries").select("id,kind,title,slug,published,noindex,updated_at").order("updated_at", { ascending: false }).limit(300);
  if (kind && (contentKinds as readonly string[]).includes(kind)) query = query.eq("kind", kind);
  const { data, error } = await query;
  const entries = (data ?? []) as Pick<AdminContent,"id" | "kind" | "title" | "slug" | "published" | "noindex" | "updated_at">[];
  return <>
  <div className="admin-toolbar"><div><p className="admin-eyebrow">Editorial</p><h1>Website content</h1><p className="admin-muted">Create and publish the places, journeys and stories your travelers discover.</p></div><Link href="/admin/content/new" className="admin-button">New entry +</Link></div>
    <form className="admin-filters"><label className="admin-field">Content type<select name="kind" defaultValue={kind ?? ""}><option value="">All content</option>{contentKinds.map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select></label><button className="admin-button secondary" type="submit">Filter</button></form>
    <section className="admin-card">{error ? <p className="admin-notice admin-error" role="alert">Content could not be loaded. Check your database setup and try again.</p> : entries.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th scope="col">Title</th><th scope="col">Type</th><th scope="col">Status</th><th scope="col">Updated</th></tr></thead><tbody>{entries.map((entry) => <tr key={entry.id}><td><Link href={`/admin/content/${entry.id}`}>{entry.title}</Link><div className="admin-small admin-muted">{entry.slug}</div></td><td>{entry.kind}</td><td><span className={`admin-badge ${entry.published ? "live" : ""}`}>{entry.published ? "Published" : "Draft"}</span>{entry.noindex && <div className="admin-small admin-muted">Excluded from search</div>}</td><td>{new Date(entry.updated_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" })}</td></tr>)}</tbody></table></div> : <p className="admin-muted">No entries yet. Create your first journey or destination to get started.</p>}{entries.length === 300 && <p className="admin-notice">Showing the most recent 300 entries. Choose a content type to narrow the list.</p>}</section>
  </>;
}
