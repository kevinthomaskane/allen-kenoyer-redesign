// Class form validation (ADR-0009: Zod + RHF). Two schemas, one field set:
//
//   classFormSchema  — what the form holds. Every field is a string (or enum /
//                      boolean), so input === output and RHF's resolver types
//                      line up cleanly (no transform divergence).
//   classWriteSchema — classFormSchema + a transform to the DB shape (numbers,
//                      empty → null). The Server Action re-validates the raw
//                      string input through this; the client is never trusted.
//
// Enum values come from the generated `Constants` so they can't drift from the
// DB enums (dev-guide § Type discipline).
import { z } from "zod";

import { Constants, type Tables } from "@/types/database";

// Validate a numeric *string* without coercing it (keeps input === output).
function numericString(opts: {
  required?: boolean;
  integer?: boolean;
  positive?: boolean;
  message: string;
}) {
  return z
    .string()
    .trim()
    .refine((s) => {
      if (s === "") return !opts.required;
      const n = Number(s);
      if (!Number.isFinite(n)) return false;
      if (opts.integer && !Number.isInteger(n)) return false;
      return opts.positive ? n > 0 : n >= 0;
    }, opts.message);
}

export const classFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    category: z.enum(Constants.public.Enums.class_category, {
      error: "Select a category",
    }),
    skill_level: z.enum(Constants.public.Enums.skill_level, {
      error: "Select a skill level",
    }),
    prerequisite: z.string().trim(),
    description: z.string().trim().min(1, "Description is required"),
    max_students: numericString({
      integer: true,
      positive: true,
      message: "Enter a positive whole number",
    }),
    tuition: numericString({ required: true, message: "Tuition is required" }),
    supply_fee: numericString({ message: "Enter a valid amount" }),
    kit_fee: numericString({ message: "Enter a valid amount" }),
    fee_notes: z.string().trim(),
    image_url: z.string().trim(),
    image_alt: z.string().trim(),
    published: z.boolean(),
  })
  .refine((v) => v.image_url === "" || v.image_alt !== "", {
    message: "Alt text is required when an image is set",
    path: ["image_alt"],
  });

/** The form's value shape — all strings, the way HTML inputs hold them. */
export type ClassFormValues = z.infer<typeof classFormSchema>;

const emptyToNull = (s: string) => (s === "" ? null : s);
const numOrNull = (s: string) => (s === "" ? null : Number(s));

/** Form values → DB column shape (numbers coerced, blanks → null). */
export const classWriteSchema = classFormSchema.transform((v) => ({
  name: v.name,
  category: v.category,
  skill_level: v.skill_level,
  prerequisite: emptyToNull(v.prerequisite),
  description: v.description,
  max_students: numOrNull(v.max_students),
  tuition: Number(v.tuition),
  supply_fee: numOrNull(v.supply_fee),
  kit_fee: numOrNull(v.kit_fee),
  fee_notes: emptyToNull(v.fee_notes),
  image_url: emptyToNull(v.image_url),
  image_alt: emptyToNull(v.image_alt),
  published: v.published,
}));

export type ClassWriteValues = z.output<typeof classWriteSchema>;

/** Defaults for a brand-new class. */
export const newClassFormValues: ClassFormValues = {
  name: "",
  category: "stained_glass",
  skill_level: "all_levels",
  prerequisite: "",
  description: "",
  max_students: "",
  tuition: "",
  supply_fee: "",
  kit_fee: "",
  fee_notes: "",
  image_url: "",
  image_alt: "",
  published: false,
};

/** Prefill the form from an existing class row, for editing. */
export function classRowToFormValues(row: Tables<"classes">): ClassFormValues {
  const num = (n: number | null) => (n === null ? "" : String(n));
  return {
    name: row.name,
    category: row.category,
    skill_level: row.skill_level,
    prerequisite: row.prerequisite ?? "",
    description: row.description,
    max_students: num(row.max_students),
    tuition: num(row.tuition),
    supply_fee: num(row.supply_fee),
    kit_fee: num(row.kit_fee),
    fee_notes: row.fee_notes ?? "",
    image_url: row.image_url ?? "",
    image_alt: row.image_alt ?? "",
    published: row.published,
  };
}
