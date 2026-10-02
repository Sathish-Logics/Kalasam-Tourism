import { createHmac } from "node:crypto";
import { inquirySchema, readInquiryBody } from "@/lib/inquiries";
import { createServiceSupabase, isSupabaseConfigured } from "@/lib/supabase/server";

export const runtime = "nodejs";

function json(body: unknown, status: number, headers: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

export async function POST(request: Request) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return json({ error: "Please submit the form as JSON." }, 415);
  }
  // The API is for our site's form. Origin-less clients still pass all other checks.
  const origin = request.headers.get("origin");
  const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin : new URL(request.url).origin;
  if (origin && origin !== expectedOrigin) return json({ error: "This request is not allowed." }, 403);
  let body: unknown;
  try { body = await readInquiryBody(request); }
  catch (error) {
    return json({ error: error instanceof Error && error.message === "BODY_TOO_LARGE" ? "The request is too large." : "The form data could not be read." }, error instanceof Error && error.message === "BODY_TOO_LARGE" ? 413 : 400);
  }
  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) return json({ error: "Please check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors }, 400);
  const input = parsed.data;
  const salt = process.env.RATE_LIMIT_SALT;
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY || !salt || salt.length < 32) {
    return json({ error: "Online inquiries are not available yet. Please use the contact details shown on this site." }, 503);
  }

  try {
    const supabase = createServiceSupabase();
    const { data: settings, error: settingsError } = await supabase.from("site_settings")
      .select("privacy_text,consent_text,consent_version").eq("id", true).single();
    if (settingsError || !settings?.privacy_text?.trim() || !settings?.consent_text?.trim() || !settings?.consent_version?.trim()) {
      return json({ error: "Online inquiries are not available yet. Please use the contact details shown on this site." }, 503);
    }

    const hash = (value: string) => createHmac("sha256", salt).update(value).digest("hex");
    const header = process.env.INQUIRY_IP_HEADER;
    // Only trust a header explicitly configured for a host which overwrites it.
    const ip = header ? request.headers.get(header)?.split(",")[0]?.trim().slice(0, 100) : null;
    const buckets = [
      { key: hash(`contact:${input.email || input.phone.replace(/\D/g, "")}`), limit: 3 },
      { key: hash(ip ? `ip:${ip}` : "global"), limit: ip ? 10 : 100 },
    ];
    for (const bucket of buckets) {
      const { data: allowed, error } = await supabase.rpc("consume_inquiry_rate_limit", { bucket_key: bucket.key, max_requests: bucket.limit, window_seconds: 900 });
      if (error) throw new Error("RATE_LIMIT_STORE_FAILED");
      if (!allowed) return json({ error: "You have sent several requests. Please try again in 15 minutes." }, 429, { "Retry-After": "900" });
    }

    const { data: inquiry, error: insertError } = await supabase.from("inquiries").insert({
      type: input.type, name: input.name, email: input.email, phone: input.phone,
      country: input.country, travel_window: input.travelWindow, traveler_count: input.travelerCount,
      interests: input.interests, message: input.message, consent_at: new Date().toISOString(),
      consent_version: settings.consent_version, source_path: input.sourcePath,
    }).select("id").single();
    if (insertError || !inquiry) throw new Error("INQUIRY_SAVE_FAILED");

    let sent = false;
    let notificationError = "email_not_configured";
    if (process.env.RESEND_API_KEY && process.env.INQUIRY_NOTIFICATION_EMAIL && process.env.RESEND_FROM_EMAIL) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `inquiry/${inquiry.id}` },
          body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL, to: [process.env.INQUIRY_NOTIFICATION_EMAIL], subject: `New ${input.type} inquiry — Kalasam Tourism`, text: `A new ${input.type} inquiry has been received.\n\nReceipt: ${inquiry.id}\n\nSign in to your staff dashboard to review it: ${expectedOrigin}/admin/inquiries\n\nContact details are stored securely in the dashboard.` }),
          signal: AbortSignal.timeout(8000),
        });
        sent = response.ok;
        notificationError = sent ? "" : "provider_rejected";
      } catch { notificationError = "provider_unavailable"; }
    }
    try {
      const { error: notificationUpdateError } = await supabase.from("inquiries").update({ notification_status: sent ? "sent" : "failed", notification_error: notificationError }).eq("id", inquiry.id);
      if (notificationUpdateError) console.error("Inquiry saved; notification status could not be updated.");
    } catch {
      console.error("Inquiry saved; notification status update unavailable.");
    }
    return json({ id: inquiry.id, status: "received" }, 201);
  } catch {
    console.error("Inquiry request failed before a receipt was returned.");
    return json({ error: "We could not save your inquiry. Please try again shortly." }, 503);
  }
}
