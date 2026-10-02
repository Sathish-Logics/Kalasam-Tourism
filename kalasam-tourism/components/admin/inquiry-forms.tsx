"use client";

import { useActionState } from "react";
import { deleteInquiry, updateInquiry } from "@/app/admin/actions";
import { FormFeedback, SubmitButton } from "./form-feedback";
import type { ActionState } from "./types";

const initialState: ActionState = {};
const statuses = ["new", "contacted", "qualified", "closed"];

export function InquiryStatusForm({ id, current }: { id: string; current: string }) {
  const [state, action] = useActionState(updateInquiry, initialState);
  return <form action={action} className="admin-row"><input type="hidden" name="id" value={id} /><label className="admin-field">Status<select name="status" defaultValue={current}>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label><SubmitButton>Save status</SubmitButton><FormFeedback state={state} /></form>;
}

export function DeleteInquiryForm({ id }: { id: string }) {
  const [state, action] = useActionState(deleteInquiry, initialState);
  return <form action={action}><input type="hidden" name="id" value={id} /><label className="admin-check"><input type="checkbox" name="confirm" required /> I understand this permanently deletes the inquiry.</label><SubmitButton className="danger">Delete inquiry</SubmitButton><FormFeedback state={state} /></form>;
}
