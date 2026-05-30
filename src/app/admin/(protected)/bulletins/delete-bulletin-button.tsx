"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { deleteBulletin } from "./actions";

export function DeleteBulletinButton({
  id,
  label,
}: {
  id: string;
  label: string;
}) {
  return (
    <form
      action={deleteBulletin}
      onSubmit={(event) => {
        if (!confirm(`Delete ${label}? This can't be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="ghost"
        size="icon"
        aria-label={`Delete ${label}`}
      >
        <Trash2 className="size-4" />
      </Button>
    </form>
  );
}
