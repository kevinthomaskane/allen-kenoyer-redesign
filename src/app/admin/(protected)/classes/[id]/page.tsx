import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { resolveClassStatus } from "@/lib/class-status";
import { classRowToFormValues } from "@/lib/class-form-schema";

import { ClassForm } from "../class-form";
import { StatusBanner } from "../status-banner";
import { StatusPill } from "../status-pill";

export const metadata: Metadata = { title: "Edit class" };

export default async function EditClassPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: cls } = await supabase
    .from("classes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!cls) notFound();

  const { data: cohorts } = await supabase
    .from("cohorts")
    .select("id, published, cohort_sessions ( ends_at )")
    .eq("class_id", id);

  const cohortRows = cohorts ?? [];
  const sessions = cohortRows.flatMap((cohort) =>
    (cohort.cohort_sessions ?? []).map((session) => ({
      cohort_id: cohort.id,
      ends_at: session.ends_at,
    })),
  );
  const status = resolveClassStatus(cls, cohortRows, sessions);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link
          href="/admin/classes"
          className="text-muted-foreground text-sm hover:underline"
        >
          ← Classes
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-serif text-2xl font-semibold">{cls.name}</h1>
          <StatusPill state={status.state} />
        </div>
      </div>

      <StatusBanner state={status.state} />

      <ClassForm
        mode="edit"
        classId={cls.id}
        defaultValues={classRowToFormValues(cls)}
      />

      <section id="cohorts" className="border-t pt-8">
        <h2 className="font-serif text-lg font-semibold">
          Cohorts &amp; sessions
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Cohort and session management arrives in task 04. The visibility
          banner above links here.
        </p>
      </section>
    </div>
  );
}
