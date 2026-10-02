import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase, isSupabaseConfigured } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const token_hash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type");
  const failed = () => NextResponse.redirect(new URL("/admin/login?error=link", request.url), { headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" } });
  if (!isSupabaseConfigured() || !token_hash || token_hash.length > 2048 || (type !== "invite" && type !== "recovery")) return failed();
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.verifyOtp({ type, token_hash });
  if (error || !data.user) return failed();
  const { data: staff, error: staffError } = await supabase.from("staff_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (staffError || !staff) {
    await supabase.auth.signOut();
    return failed();
  }
  return NextResponse.redirect(new URL("/admin/password", request.url), { headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" } });
}
