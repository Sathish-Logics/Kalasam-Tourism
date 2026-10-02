import Link from "next/link";
import { requireStaff } from "@/lib/supabase/server";
import { PasswordForm } from "@/components/admin/auth-form";

export default async function PasswordPage() {
  await requireStaff();
  return <main id="admin-content" className="admin-auth-page">
    <div className="admin-login">
      <div className="admin-card">
        <p className="admin-eyebrow">Staff account</p>
        <h1>Set your password.</h1>
        <p className="admin-muted">Choose a secure password for your Kalasam staff account.</p>
        <PasswordForm />
      </div>
      <Link href="/admin" className="admin-subtle-link">Back to dashboard</Link>
    </div>
    </main>;
}
