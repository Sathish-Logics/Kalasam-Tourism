"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { inquirySchema } from "@/lib/inquiries";
import type { InquiryType } from "@/lib/types";

type FieldErrors = Record<string, string[]>;
type Props = { type?: InquiryType; interests?: string; consentText: string };

const typeLabels: Record<InquiryType, string> = {
  journey: "Send my journey request",
  ceremony: "Send my ceremony request",
  senior: "Send my travel request",
  partner: "Send partnership inquiry",
  contact: "Send my message",
};

export function InquiryForm({ type = "journey", interests = "", consentText }: Props) {
  const sourcePath = usePathname();
  const formRef = useRef<HTMLFormElement>(null);
  const confirmationRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState("");
  const travelRequest = type === "journey" || type === "ceremony" || type === "senior";

  useEffect(() => { if (receipt) confirmationRef.current?.focus(); }, [receipt]);
  useEffect(() => {
    if (Object.keys(errors).length) {
      const name = Object.keys(errors)[0];
      const field = formRef.current?.elements.namedItem(name);
      if (field instanceof HTMLElement) field.focus();
      else summaryRef.current?.focus();
    } else if (error) summaryRef.current?.focus();
  }, [errors, error]);

  const fieldError = (name: string) => errors[name]?.length ? <p className="form-error" id={`${name}-error`}>{errors[name][0]}</p> : null;
  const aria = (name: string, hint?: string) => ({
    "aria-invalid": errors[name]?.length ? true as const : undefined,
    "aria-describedby": [hint, errors[name]?.length ? `${name}-error` : ""].filter(Boolean).join(" ") || undefined,
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError("");
    setErrors({});
    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) || "").trim();
    const value = {
      type,
      name: text("name"),
      email: text("email"),
      phone: text("phone"),
      country: text("country"),
      travelWindow: text("travelWindow"),
      travelerCount: text("travelerCount") ? Number(text("travelerCount")) : null,
      interests: text("interests").split(",").map((item) => item.trim()).filter(Boolean),
      message: text("message"),
      consent: form.get("consent") === "on",
      sourcePath,
      website: text("website"),
    };
    const parsed = inquirySchema.safeParse(value);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] || "form");
        (fieldErrors[key] ||= []).push(issue.message);
      }
      setErrors(fieldErrors);
      setError("Please check the highlighted details before sending.");
      return;
    }
    setPending(true);
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const result = await response.json();
      if (!response.ok) {
        setErrors(result.fieldErrors || {});
        setError(typeof result.error === "string" ? result.error : "We couldn’t send your request. Please try again shortly.");
        return;
      }
      if (typeof result.id !== "string" || result.status !== "received") throw new Error("Unconfirmed response");
      setReceipt(result.id);
      formRef.current?.reset();
    } catch {
      setError("We couldn’t confirm your request. Please check your connection or contact us before sending it again.");
    } finally {
      setPending(false);
    }
  }

  if (receipt) return <div className="form-success" role="status"><span className="eyebrow">Your next chapter starts here</span><h2 ref={confirmationRef} tabIndex={-1}>Thank you. We have your request.</h2><p>The Kalasam team can now review your preferences and contact you using the details you shared.</p><p className="form-note">Your reference: <strong>{receipt}</strong></p><Link className="button button-gold" href="/journeys">Keep exploring journeys →</Link></div>;

  return <form ref={formRef} className="inquiry-form" method="post" action="/api/inquiries" onSubmit={submit} noValidate aria-busy={pending}>
    <noscript><p className="form-error">Please enable JavaScript to send this form, or use the contact links to reach the team.</p></noscript>
    <div className="field field-wide"><p className="form-note">Fields marked * are required. Please provide an email address or phone number.</p></div>
    {error && <div className="form-error field-wide" role="alert" ref={summaryRef} tabIndex={-1}>{error}</div>}
    <div className="field"><label htmlFor="name">Your name *</label><input className="input" id="name" name="name" autoComplete="name" minLength={2} maxLength={100} required {...aria("name")} />{fieldError("name")}</div>
    <div className="field"><label htmlFor="country">Country / region *</label><input className="input" id="country" name="country" list="origin-countries" autoComplete="country-name" minLength={2} maxLength={100} placeholder="Where are you travelling from?" required {...aria("country")} /><datalist id="origin-countries"><option value="India" /><option value="Malaysia" /><option value="Singapore" /><option value="Sri Lanka" /></datalist>{fieldError("country")}</div>
    <div className="field"><label htmlFor="email">Email address</label><input className="input" id="email" name="email" type="email" autoComplete="email" maxLength={254} {...aria("email", "contact-help")} />{fieldError("email")}</div>
    <div className="field"><label htmlFor="phone">Phone / WhatsApp number</label><input className="input" id="phone" name="phone" type="tel" autoComplete="tel" maxLength={30} placeholder="Include country code" {...aria("phone", "contact-help")} />{fieldError("phone")}</div>
    <p className="form-note field-wide" id="contact-help">Share at least one way for our team to reach you.</p>
    {travelRequest && <>
      <div className="field"><label htmlFor="travelWindow">When would you like to travel?</label><input className="input" id="travelWindow" name="travelWindow" maxLength={200} placeholder="e.g. December, or my dates are flexible" {...aria("travelWindow")} />{fieldError("travelWindow")}</div>
      <div className="field"><label htmlFor="travelerCount">Number of travellers</label><input className="input" id="travelerCount" name="travelerCount" type="number" min={1} max={100} step={1} inputMode="numeric" placeholder="Including children" {...aria("travelerCount")} />{fieldError("travelerCount")}</div>
      <div className="field field-wide"><label htmlFor="interests">Places or experiences on your mind</label><input className="input" id="interests" name="interests" maxLength={1200} defaultValue={interests} placeholder="e.g. Tamil Nadu, temple heritage, family time" {...aria("interests", "interests-help")} /><p className="form-note" id="interests-help">Separate your interests with commas.</p>{fieldError("interests")}</div>
    </>}
    <div className="field field-wide"><label htmlFor="message">{type === "partner" ? "Tell us about your business and partnership interests" : type === "contact" ? "Your message" : "Tell us a little about your plans"} *</label><textarea className="input" id="message" name="message" rows={5} minLength={10} maxLength={4000} required placeholder={type === "senior" ? "Share practical arrangements such as a gentler pace or help with steps." : type === "partner" ? "Your organization, the guests you serve, and your partnership ideas." : type === "contact" ? "How can we help?" : "What would make this journey meaningful to you?"} {...aria("message", type === "senior" ? "accessibility-help" : undefined)} />{type === "senior" && <p className="form-note" id="accessibility-help">Please describe practical travel needs only. Do not include medical records or diagnoses.</p>}{fieldError("message")}</div>
    <div className="honeypot" aria-hidden="true"><label htmlFor="website">Leave this field empty</label><input id="website" name="website" autoComplete="off" tabIndex={-1} /></div>
    <div className="field field-wide"><label className="consent-field" htmlFor="consent"><input id="consent" name="consent" type="checkbox" required {...aria("consent")} /><span>{consentText} * <Link href="/privacy">Read our privacy notice</Link>.</span></label>{fieldError("consent")}</div>
    <div className="field-wide"><button type="submit" className="button button-gold" disabled={pending}>{pending ? "Sending your request…" : typeLabels[type]} <span aria-hidden="true">→</span></button><p className="form-note">Sending an inquiry starts a conversation. Your travel arrangements are confirmed separately with the team.</p></div>
  </form>;
}
