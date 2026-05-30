import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { resolveClassStatus } from "@/lib/class-status";
import { formatStudioDate, formatStudioDateTime } from "@/lib/studio-time";
import type { ClassListRow } from "@/lib/class-list";

import { ClassesTable } from "./classes-table";

export const metadata: Metadata = { title: "Classes" };

// Rich list (ADR-0021 decision J). Status and Next-session both derive from the
// per-class cohorts + sessions (ADR-0015 visibility rule); the join runs per
// load, acceptable at studio scale (~30 classes).
export default async function ClassesListPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("classes")
    .select(
      "id, name, slug, category, skill_level, published, updated_at, cohorts ( id, published, cohort_sessions ( starts_at, ends_at ) )",
    );

  const now = new Date();
  const rows: ClassListRow[] = (data ?? []).map((cls) => {
    const cohorts = cls.cohorts ?? [];
    const sessions = cohorts.flatMap((cohort) =>
      (cohort.cohort_sessions ?? []).map((session) => ({
        cohort_id: cohort.id,
        starts_at: session.starts_at,
        ends_at: session.ends_at,
      })),
    );
    const status = resolveClassStatus(cls, cohorts, sessions, now);
    const publishedCohortIds = new Set(
      cohorts.filter((cohort) => cohort.published).map((cohort) => cohort.id),
    );
    const nextSessionAt =
      sessions
        .filter(
          (session) =>
            publishedCohortIds.has(session.cohort_id) &&
            new Date(session.ends_at) > now,
        )
        .map((session) => session.starts_at)
        .sort()[0] ?? null;

    return {
      id: cls.id,
      name: cls.name,
      slug: cls.slug,
      category: cls.category,
      skillLevel: cls.skill_level,
      status: status.state,
      nextSessionAt,
      nextSessionLabel: nextSessionAt
        ? formatStudioDateTime(nextSessionAt)
        : "—",
      updatedAt: cls.updated_at,
      updatedLabel: formatStudioDate(cls.updated_at),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-semibold">Classes</h1>
          <p className="text-muted-foreground">
            Create, edit, and publish classes.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/classes/new">New class</Link>
        </Button>
      </div>

      {error ? (
        <p role="alert" className="text-destructive text-sm">
          Couldn’t load classes: {error.message}
        </p>
      ) : (
        <ClassesTable rows={rows} />
      )}
    </div>
  );
}
