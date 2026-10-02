import { z } from "zod";
import { inquiryTypes } from "./types";

const optionalText = (max: number) => z.string().trim().max(max).optional().default("");

export const inquirySchema = z.object({
  type: z.enum(inquiryTypes),
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  email: optionalText(254).refine((value) => !value || z.email().safeParse(value).success, "Enter a valid email address.").transform((value) => value.toLowerCase()),
  phone: optionalText(30).refine((value) => !value || /^\+?[0-9 ()-]{7,30}$/.test(value) && value.replace(/\D/g, "").length >= 7, "Enter a valid phone number."),
  country: z.string().trim().min(2, "Please choose your country or region.").max(100),
  travelWindow: optionalText(200),
  travelerCount: z.number().int().min(1).max(100).nullable().optional().default(null),
  interests: z.array(z.string().trim().min(1).max(100)).max(12).optional().default([]),
  message: z.string().trim().min(10, "Please tell us a little more (at least 10 characters).").max(4000),
  consent: z.literal(true, { error: "Please agree to the privacy notice so we can respond." }),
  sourcePath: z.string().max(300).regex(/^\/(?!\/)[a-zA-Z0-9/_-]*$/, "Invalid source page.").optional().default("/"),
  website: z.string().max(0).optional().default(""),
}).strict().superRefine((value, context) => {
  if (!value.email && !value.phone) {
    context.addIssue({ code: "custom", path: ["email"], message: "Enter an email address or phone number so we can contact you." });
    context.addIssue({ code: "custom", path: ["phone"], message: "An email address or phone number is required." });
  }
});

export type InquiryInput = z.infer<typeof inquirySchema>;

/** Read a stream with an actual byte bound, including chunked requests. */
export async function readInquiryBody(request: Request, maxBytes = 16_384): Promise<unknown> {
  const length = Number(request.headers.get("content-length") || "0");
  if (!Number.isFinite(length) || length > maxBytes) throw new Error("BODY_TOO_LARGE");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("INVALID_JSON");
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new Error("BODY_TOO_LARGE");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let position = 0;
  chunks.forEach((chunk) => { bytes.set(chunk, position); position += chunk.byteLength; });
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new Error("INVALID_JSON"); }
}
