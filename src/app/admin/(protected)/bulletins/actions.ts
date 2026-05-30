"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { wallTimeToUtc } from "@/lib/studio-time";
import type { TablesInsert } from "@/types/database";

import { bulletinFormSchema, type BulletinFormValues } from "./schema";

export interface BulletinActionError {
  error: string;
}

// Map validated form values (wall-clock strings) to a DB row: empty strings
// become null, wall times convert to UTC instants (src/lib/studio-time.ts).
function toRow(values: BulletinFormValues): TablesInsert<"bulletins"> {
  return {
    title: values.title.trim() === "" ? null : values.title.trim(),
    message: values.message,
    display_start: wallTimeToUtc(values.displayStart),
    display_end:
      values.displayEnd === "" ? null : wallTimeToUtc(values.displayEnd),
    published: values.published,
  };
}

export async function createBulletin(
  values: BulletinFormValues,
): Promise<BulletinActionError | void> {
  const parsed = bulletinFormSchema.safeParse(values);
  if (!parsed.success) return { error: "Please fix the highlighted fields." };

  const supabase = await createClient();
  const { error } = await supabase.from("bulletins").insert(toRow(parsed.data));
  if (error) return { error: error.message };

  revalidatePath("/admin/bulletins");
  redirect("/admin/bulletins");
}

export async function updateBulletin(
  id: string,
  values: BulletinFormValues,
): Promise<BulletinActionError | void> {
  const parsed = bulletinFormSchema.safeParse(values);
  if (!parsed.success) return { error: "Please fix the highlighted fields." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("bulletins")
    .update(toRow(parsed.data))
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/bulletins");
  redirect("/admin/bulletins");
}

// Invoked as a <form> action from the list; the row id rides in form data.
export async function deleteBulletin(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("bulletins").delete().eq("id", id);
  revalidatePath("/admin/bulletins");
}
