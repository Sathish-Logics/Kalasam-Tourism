import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/supabase/server";
import { ContentForm } from "@/components/admin/content-form";
import type { AdminContent } from "@/components/admin/types";

export default async function EditContentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  const { supabase } = await requireStaff();
  const { id } = await params;
  const { created } = await searchParams;
  let entry: AdminContent | undefined;
  if (id !== "new") {
    if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
    const { data, error } = await supabase.from("content_entries").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error("Content could not be loaded.");
    if (!data) notFound();
    entry = data as AdminContent;
  }
  return <><p className="admin-eyebrow">Editorial</p><h1>{entry ? "Edit your story." : "A new story begins."}</h1><p className="admin-muted">Clear details and thoughtful imagery help travelers plan with confidence.</p><ContentForm entry={entry} created={created === "1"} /></>;
}
