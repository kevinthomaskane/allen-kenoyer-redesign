// Pure markdown-insertion logic for the bulletin message toolbar (ADR-0016:
// Kristin doesn't type raw syntax — buttons insert it). Kept framework-free and
// separate from the "use client" toolbar component so it can be unit-tested.

export type MarkdownCommand = "bold" | "italic" | "link" | "list";

export interface MarkdownEdit {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

/**
 * Apply a toolbar command to `value` given the current selection range, and
 * return the new value plus the selection range to restore afterward.
 *
 * - bold/italic wrap the selection (cursor lands inside the markers when nothing
 *   is selected).
 * - link produces `[label](url)` and selects the `url` placeholder so the next
 *   keystroke replaces it.
 * - list prefixes each selected line with `- `.
 */
export function applyMarkdownSyntax(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  command: MarkdownCommand,
): MarkdownEdit {
  const before = value.slice(0, selectionStart);
  const selected = value.slice(selectionStart, selectionEnd);
  const after = value.slice(selectionEnd);

  if (command === "bold" || command === "italic") {
    const marker = command === "bold" ? "**" : "*";
    const inner = selected;
    const start = before.length + marker.length;
    return {
      value: `${before}${marker}${inner}${marker}${after}`,
      selectionStart: start,
      selectionEnd: start + inner.length,
    };
  }

  if (command === "link") {
    const label = selected || "text";
    const url = "url";
    const start = before.length + `[${label}](`.length;
    return {
      value: `${before}[${label}](${url})${after}`,
      selectionStart: start,
      selectionEnd: start + url.length,
    };
  }

  // list: prefix every selected line (or the empty cursor line) with "- ".
  const lines = (selected.length ? selected : "").split("\n");
  const listed = lines.map((line) => `- ${line}`).join("\n");
  return {
    value: `${before}${listed}${after}`,
    selectionStart: before.length,
    selectionEnd: before.length + listed.length,
  };
}
