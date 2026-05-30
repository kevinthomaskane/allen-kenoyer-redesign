"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/slug";

const BUCKET = "site-images";

// `classes/<uuid>-<safe-name>` — the UUID prevents two classes that upload a
// file of the same name from clobbering each other. The ADR's orphan residual
// (pick a file, never Save) is accepted (ADR-0021 decision H).
function storagePath(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  const base = dot > 0 ? fileName.slice(0, dot) : fileName;
  const ext =
    dot > 0
      ? fileName
          .slice(dot + 1)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
      : "";
  const stem = slugify(base);
  return `classes/${crypto.randomUUID()}-${ext ? `${stem}.${ext}` : stem}`;
}

export function ClassImageField({
  value,
  alt,
  onChange,
  disabled,
}: {
  value: string;
  alt: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // let the same file be re-picked later
    if (!file) return;

    setError(null);
    setUploading(true);

    const supabase = createClient();
    const path = storagePath(file.name);
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        upsert: true,
        cacheControl: "3600",
        contentType: file.type,
      });

    setUploading(false);
    if (uploadError) {
      setError(uploadError.message);
      return;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    onChange(data.publicUrl);
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="flex items-start gap-4">
          <div className="bg-muted relative h-32 w-44 overflow-hidden rounded-md border">
            <Image
              src={value}
              alt={alt || "Class image preview"}
              fill
              sizes="176px"
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || uploading}
            onClick={() => onChange("")}
          >
            <X className="size-4" />
            Remove
          </Button>
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Class image file"
        disabled={disabled || uploading}
        onChange={(event) => void handleFile(event)}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || uploading}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ImagePlus className="size-4" />
        )}
        {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
      </Button>

      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
