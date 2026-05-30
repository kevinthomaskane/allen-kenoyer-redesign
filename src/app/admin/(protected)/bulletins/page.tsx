import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { formatStudioDateTime } from "@/lib/studio-time";
import { bulletinStatus } from "@/lib/visibility";
import type { Tables } from "@/types/database";

import { DeleteBulletinButton } from "./delete-bulletin-button";
import { BulletinStatusBadge } from "./status-badge";

export const metadata: Metadata = { title: "Bulletins" };

type Bulletin = Tables<"bulletins">;

function formatWindow(bulletin: Bulletin): string {
  const start = formatStudioDateTime(bulletin.display_start);
  const end = bulletin.display_end
    ? formatStudioDateTime(bulletin.display_end)
    : "Open-ended";
  return `${start} → ${end}`;
}

function BulletinRows({ bulletins }: { bulletins: Bulletin[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Display window</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bulletins.map((bulletin) => {
          const label = bulletin.title?.trim() || "Untitled bulletin";
          return (
            <TableRow key={bulletin.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/admin/bulletins/${bulletin.id}`}
                  className="hover:underline"
                >
                  {label}
                </Link>
              </TableCell>
              <TableCell>
                <BulletinStatusBadge status={bulletinStatus(bulletin)} />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatWindow(bulletin)}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/bulletins/${bulletin.id}`}>Edit</Link>
                  </Button>
                  <DeleteBulletinButton id={bulletin.id} label={label} />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default async function BulletinsListPage({
  searchParams,
}: {
  searchParams: Promise<{ past?: string }>;
}) {
  const { past } = await searchParams;
  const showPast = past === "1";

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bulletins")
    .select("*")
    .order("display_start", { ascending: false });

  const bulletins = data ?? [];
  // Active = anything not expired (draft / queued / visible); past = expired.
  // Mirrors the cohort lifecycle pattern (ADR-0016 / ADR-0021 L).
  const active = bulletins.filter((b) => bulletinStatus(b) !== "expired");
  const expired = bulletins.filter((b) => bulletinStatus(b) === "expired");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-semibold">Bulletins</h1>
          <p className="text-muted-foreground">
            Homepage announcements. Drafts and queued bulletins stay hidden
            until their start date.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/bulletins/new">
            <Plus className="size-4" />
            New bulletin
          </Link>
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-destructive text-sm">
          Couldn’t load bulletins: {error.message}
        </p>
      )}

      {active.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-dashed p-8 text-center">
          No active bulletins. Create one to show an announcement on the
          homepage.
        </p>
      ) : (
        <BulletinRows bulletins={active} />
      )}

      <div className="space-y-4">
        {showPast ? (
          <>
            <Button asChild variant="link" className="px-0">
              <Link href="/admin/bulletins">Hide past bulletins</Link>
            </Button>
            {expired.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No past bulletins.
              </p>
            ) : (
              <BulletinRows bulletins={expired} />
            )}
          </>
        ) : (
          <Button asChild variant="link" className="px-0">
            <Link href="/admin/bulletins?past=1">
              Show past bulletins ({expired.length})
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
