// Single Zod schema for the bulletin form, reused by the client form
// (zodResolver) and the Server Action's server-side validation (ADR-0009).
// Fields carry the form's wall-clock datetime-local strings; the Server Action
// converts them to UTC (src/lib/studio-time.ts) before writing.
import { z } from "zod";

export const bulletinFormSchema = z
  .object({
    // Optional title (ADR-0016) — empty string is allowed and stored as null.
    title: z.string().trim().max(200, "Title is too long"),
    message: z.string().trim().min(1, "A message is required"),
    // datetime-local wall-clock values ("yyyy-MM-ddTHH:mm"). display_start is
    // required (defaults to "now" in the form); display_end is optional.
    displayStart: z.string().min(1, "A start date is required"),
    displayEnd: z.string(),
    published: z.boolean(),
  })
  // Mirrors the DB `bulletins_end_after_start` CHECK. String compare is
  // chronological because both are same-zone "yyyy-MM-ddTHH:mm" values.
  .refine((v) => v.displayEnd === "" || v.displayEnd > v.displayStart, {
    message: "The end date must be after the start date",
    path: ["displayEnd"],
  });

export type BulletinFormValues = z.infer<typeof bulletinFormSchema>;
