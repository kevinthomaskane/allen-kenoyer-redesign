"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  classWriteSchema,
  type ClassFormValues,
} from "@/lib/class-form-schema";
import { uniqueSlug } from "@/lib/slug";
import type { TablesInsert, TablesUpdate } from "@/types/database";

export type ClassActionResult = { ok: false; error: string };

async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/admin/login");
  return supabase;
}

/**
 * Build a slug from `name` that is unique across all classes except the one
 * being edited (`excludeId`). Auto-derived on every save (ADR-0015).
 */
async function deriveSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  name: string,
  excludeId?: string,
): Promise<string> {
  let query = supabase.from("classes").select("slug, id");
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query;
  return uniqueSlug(
    name,
    (data ?? []).map((row) => row.slug),
  );
}

export async function createClass(
  input: ClassFormValues,
): Promise<ClassActionResult> {
  const parsed = classWriteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields." };
  }

  const supabase = await requireAdmin();
  const slug = await deriveSlug(supabase, parsed.data.name);

  const insert: TablesInsert<"classes"> = { ...parsed.data, slug };
  const { data, error } = await supabase
    .from("classes")
    .insert(insert)
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/classes");
  redirect(`/admin/classes/${data.id}`);
}

export async function updateClass(
  id: string,
  input: ClassFormValues,
): Promise<ClassActionResult> {
  const parsed = classWriteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields." };
  }

  const supabase = await requireAdmin();
  const slug = await deriveSlug(supabase, parsed.data.name, id);

  const update: TablesUpdate<"classes"> = {
    ...parsed.data,
    slug,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("classes").update(update).eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/classes");
  revalidatePath(`/admin/classes/${id}`);
  redirect(`/admin/classes/${id}`);
}
