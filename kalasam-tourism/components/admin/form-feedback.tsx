"use client";

import { useFormStatus } from "react-dom";
import type { ActionState } from "./types";

export function FormFeedback({ state }: { state: ActionState }) {
  return <>{state.error && <p className="admin-notice admin-error" role="alert">{state.error}</p>}{state.success && <p className="admin-notice admin-success" role="status">{state.success}</p>}</>;
}

export function SubmitButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return <button className={`admin-button ${className}`} type="submit" disabled={pending}>{pending ? "Saving…" : children}</button>;
}
