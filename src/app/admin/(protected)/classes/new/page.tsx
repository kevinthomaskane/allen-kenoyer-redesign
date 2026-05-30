import type { Metadata } from "next";
import Link from "next/link";

import { ClassForm } from "../class-form";

export const metadata: Metadata = { title: "New class" };

export default function NewClassPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href="/admin/classes"
          className="text-muted-foreground text-sm hover:underline"
        >
          ← Classes
        </Link>
        <h1 className="font-serif text-2xl font-semibold">New class</h1>
      </div>
      <ClassForm mode="create" />
    </div>
  );
}
