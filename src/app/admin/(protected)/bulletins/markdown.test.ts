import { describe, expect, it } from "vitest";

import { applyMarkdownSyntax } from "./markdown";

describe("applyMarkdownSyntax", () => {
  it("wraps a selection in bold markers and reselects the inner text", () => {
    // "hello world", select "world" (6..11)
    const edit = applyMarkdownSyntax("hello world", 6, 11, "bold");
    expect(edit.value).toBe("hello **world**");
    expect(edit.value.slice(edit.selectionStart, edit.selectionEnd)).toBe(
      "world",
    );
  });

  it("inserts empty italic markers with the cursor between them", () => {
    const edit = applyMarkdownSyntax("", 0, 0, "italic");
    expect(edit.value).toBe("**");
    expect(edit.selectionStart).toBe(1);
    expect(edit.selectionEnd).toBe(1);
  });

  it("builds a link from the selection and selects the url placeholder", () => {
    const edit = applyMarkdownSyntax("call us today", 0, 7, "link");
    expect(edit.value).toBe("[call us](url) today");
    expect(edit.value.slice(edit.selectionStart, edit.selectionEnd)).toBe(
      "url",
    );
  });

  it("uses a 'text' placeholder for a link with no selection", () => {
    const edit = applyMarkdownSyntax("", 0, 0, "link");
    expect(edit.value).toBe("[text](url)");
    expect(edit.value.slice(edit.selectionStart, edit.selectionEnd)).toBe(
      "url",
    );
  });

  it("prefixes each selected line with a list marker", () => {
    const edit = applyMarkdownSyntax("one\ntwo", 0, 7, "list");
    expect(edit.value).toBe("- one\n- two");
  });
});
