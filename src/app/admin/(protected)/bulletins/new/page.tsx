import type { Metadata } from "next";
import Link from "next/link";

import { nowWallTimeInput } from "@/lib/studio-time";

import { createBulletin } from "../actions";
import { BulletinForm } from "../bulletin-form";

export const metadata: Metadata = { title: "New bulletin" };

export default function NewBulletinPage() {
  // Rendered dynamically (the protected layout reads auth cookies), so this is
  // request-time "now" — the form's display_start default (ADR-0016).
  const defaultValues = {
    title: "",
    message: "",
    displayStart: nowWallTimeInput(),
    displayEnd: "",
    published: false,
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin/bulletins"
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← Bulletins
      </Link>
      <h1 className="font-serif text-2xl font-semibold">New bulletin</h1>
      <BulletinForm
        defaultValues={defaultValues}
        action={createBulletin}
        submitLabel="Create bulletin"
      />
    </div>
  );
}
