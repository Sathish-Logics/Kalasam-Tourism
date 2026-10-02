import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/auth-form";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const configured = isSupabaseConfigured();
  if (configured) {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: staff } = await supabase.from("staff_users").select("user_id").eq("user_id", user.id).maybeSingle();
      if (staff) redirect("/admin");
    }
  }
  return <main id="admin-content" className="admin-auth-page"><div className="admin-login">
    <Link href="/" className="admin-auth-brand"><span className="admin-eyebrow">Kalasam Tourism</span></Link>
    <div className="admin-card"><p className="admin-eyebrow">For the Kalasam team</p><h1>Welcome back.</h1><p className="admin-muted">Manage your journeys, content and traveler inquiries.</p>
      {error && <p className="admin-notice admin-error" role="alert">This invitation or recovery link could not be verified, or the account has no staff access. Ask your administrator for a new link.</p>}
      {configured ? <LoginForm /> : <div className="admin-notice"><strong>Staff sign-in needs setup.</strong><p>Configure the Supabase environment variables, apply the database migration, and invite a staff account. The project README includes the setup steps.</p></div>}
    </div><Link href="/" className="admin-subtle-link">← Back to the website</Link>
  </div></main>;
}
