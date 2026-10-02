"use client";

import { useActionState } from "react";
import { login, setPassword } from "@/app/admin/actions";
import { FormFeedback, SubmitButton } from "./form-feedback";

export function LoginForm() {
  const [state, action] = useActionState(login, {});
  return <form action={action}>
    <label className="admin-field">Staff email<input type="email" name="email" autoComplete="username" maxLength={254} required /></label>
    <label className="admin-field">Password<input type="password" name="password" autoComplete="current-password" maxLength={200} required /></label>
    <FormFeedback state={state} />
    <SubmitButton>Sign in</SubmitButton>
    <p className="admin-muted admin-small" style={{ marginTop: 20 }}>Need access or a password reset? Ask your site administrator to send an invitation or recovery link.</p>
  </form>;
}

export function PasswordForm() {
  const [state, action] = useActionState(setPassword, {});
  return <form action={action}>
    <label className="admin-field">New password<input type="password" name="password" autoComplete="new-password" minLength={12} maxLength={200} required /><small>Use at least 12 characters. A unique passphrase works well.</small></label>
    <label className="admin-field">Confirm new password<input type="password" name="confirmation" autoComplete="new-password" minLength={12} maxLength={200} required /></label>
    <FormFeedback state={state} /><SubmitButton>Save password</SubmitButton>
  </form>;
}
