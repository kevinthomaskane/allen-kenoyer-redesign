import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { utcToWallTimeInput } from "@/lib/studio-time";

import { updateBulletin } from "../actions";
import { BulletinForm } from "../bulletin-form";

export const metadata: Metadata = { title: "Edit bulletin" };

export default async function EditBulletinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: bulletin } = await supabase
    .from("bulletins")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!bulletin) notFound();

  const defaultValues = {
    title: bulletin.title ?? "",
    message: bulletin.message,
    displayStart: utcToWallTimeInput(bulletin.display_start),
    displayEnd: bulletin.display_end
      ? utcToWallTimeInput(bulletin.display_end)
      : "",
    published: bulletin.published,
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin/bulletins"
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← Bulletins
      </Link>
      <h1 className="font-serif text-2xl font-semibold">Edit bulletin</h1>
      <BulletinForm
        defaultValues={defaultValues}
        action={updateBulletin.bind(null, id)}
        submitLabel="Save changes"
      />
    </div>
  );
}
