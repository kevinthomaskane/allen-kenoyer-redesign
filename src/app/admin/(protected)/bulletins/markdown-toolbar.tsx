"use client";

import type { RefObject } from "react";
import { Bold, Italic, Link2, List } from "lucide-react";

import { Button } from "@/components/ui/button";

import { applyMarkdownSyntax, type MarkdownCommand } from "./markdown";

const COMMANDS: {
  command: MarkdownCommand;
  label: string;
  Icon: typeof Bold;
}[] = [
  { command: "bold", label: "Bold", Icon: Bold },
  { command: "italic", label: "Italic", Icon: Italic },
  { command: "link", label: "Link", Icon: Link2 },
  { command: "list", label: "Bulleted list", Icon: List },
];

export interface MarkdownToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onChange: (value: string) => void;
}

// Toolbar over the message textarea — buttons insert markdown so Kristin never
// types raw syntax (ADR-0016). Selection logic lives in ./markdown (pure, tested).
export function MarkdownToolbar({
  textareaRef,
  onChange,
}: MarkdownToolbarProps) {
  function run(command: MarkdownCommand) {
    const el = textareaRef.current;
    if (!el) return;

    const edit = applyMarkdownSyntax(
      el.value,
      el.selectionStart,
      el.selectionEnd,
      command,
    );
    onChange(edit.value);

    // Restore focus + selection after React commits the new value.
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(edit.selectionStart, edit.selectionEnd);
    });
  }

  return (
    <div role="toolbar" aria-label="Formatting" className="flex gap-1">
      {COMMANDS.map(({ command, label, Icon }) => (
        <Button
          key={command}
          type="button"
          variant="outline"
          size="icon"
          aria-label={label}
          onClick={() => run(command)}
        >
          <Icon className="size-4" />
        </Button>
      ))}
    </div>
  );
}
