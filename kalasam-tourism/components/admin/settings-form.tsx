"use client";

import { useActionState } from "react";
import { saveSettings } from "@/app/admin/actions";
import { FormFeedback, SubmitButton } from "./form-feedback";
import type { ActionState, AdminSettings } from "./types";

export function SettingsForm({ settings }: { settings: AdminSettings }) {
  const [state, action] = useActionState(saveSettings, {} as ActionState);
  return <form action={action} className="admin-card">
    <h2>Public contact information</h2>
    <label className="admin-field">Brand name<input name="brand_name" required maxLength={100} defaultValue={settings.brand_name} /></label>
    <div className="admin-grid"><label className="admin-field">Contact email<input type="email" name="email" maxLength={254} defaultValue={settings.email} /></label><label className="admin-field">Phone<input type="tel" name="phone" maxLength={50} defaultValue={settings.phone} /></label></div>
    <label className="admin-field">WhatsApp number with country code<small>Digits only, including country code. Used for click-to-chat buttons.</small><input type="tel" name="whatsapp" inputMode="numeric" maxLength={15} placeholder="Example: 919876543210" defaultValue={settings.whatsapp} /></label>
    <label className="admin-field">Address or service area<textarea name="address" maxLength={500} defaultValue={settings.address} /></label>
    <div className="admin-grid"><label className="admin-field">Instagram URL<input type="url" name="instagram" maxLength={500} defaultValue={settings.instagram} /></label><label className="admin-field">Facebook URL<input type="url" name="facebook" maxLength={500} defaultValue={settings.facebook} /></label></div>
    <hr /><h2>Approved inquiry and privacy wording</h2><p className="admin-notice">Copy the client-approved policy and consent wording here. Inquiry forms stay disabled until all three fields are saved.</p>
    <label className="admin-field">Privacy notice text<textarea name="privacy_text" required maxLength={30000} rows={10} defaultValue={settings.privacy_text} /><small>Use only wording approved by the client.</small></label>
    <label className="admin-field">Inquiry consent checkbox wording<textarea name="consent_text" required maxLength={1000} rows={3} defaultValue={settings.consent_text} /></label>
    <label className="admin-field">Consent wording version<input name="consent_version" required maxLength={64} placeholder="For example: 2026-10-v1" defaultValue={settings.consent_version} /><small>Change the version when approved consent wording changes.</small></label>
    <FormFeedback state={state} /><SubmitButton>Save site settings</SubmitButton>
  </form>;
}
