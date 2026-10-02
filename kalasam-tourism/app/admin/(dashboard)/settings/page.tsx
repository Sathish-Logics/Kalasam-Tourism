import { requireStaff } from "@/lib/supabase/server";
import type { AdminSettings } from "@/components/admin/types";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function SettingsPage() {
  const { supabase } = await requireStaff();
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", true).single();
  return <><p className="admin-eyebrow">Site setup</p><h1>Settings</h1><p className="admin-muted">Manage the brand and contact details visitors see.</p>{error || !data ? <p className="admin-notice admin-error" role="alert">Settings could not be loaded. Apply the database migration and try again.</p> : <SettingsForm settings={data as AdminSettings} />}</>;
}
