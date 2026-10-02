import Link from "next/link";
import { requireStaff } from "@/lib/supabase/server";
import { logout } from "../actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireStaff();
  return <><header className="admin-header">
    <Link href="/admin" className="admin-brand">KALASAM / STUDIO</Link>
    <nav aria-label="Dashboard navigation">
      <Link href="/admin">Overview</Link>
      <Link href="/admin/content">Content</Link>
      <Link href="/admin/inquiries">Inquiries</Link>
      <Link href="/admin/settings">Settings</Link>
      <Link href="/" target="_blank" rel="noopener noreferrer">View website ↗</Link>
      </nav>
      <form action={logout}>
        <button type="submit" className="admin-button secondary">Sign out</button>
      </form>
      </header>
      <main id="admin-content" className="admin-main">
        <p className="admin-small admin-muted">Signed in as {user.email}</p>{children}</main>
    </>;
}
