# Content Extraction Plan
**Project:** Allen Kenoyer Glass Website Rebuild
**Purpose:** Download and organize all existing site content and images for use in the new site build.

---

## Goal

Mirror the existing site at allenkenoyerglass.com, extract page content and images, and store them in a structured `/content/` directory. Pages that will be merged on the new site should have their content combined into a single file with clear source markers.

---

## Output Structure

The content tree mirrors the **new site's URL structure**, not the existing site's, so it's clear where each `content.md` ends up.

```
/content/
  home/
    content.md
    images/
  custom-design/
    content.md
    images/
  classes/
    content.md
    images/
    calendar/
      content.md          (note: source page was a Google Calendar iframe — no text content)
  supplies/
    content.md
    images/
    patterns/
      content.md
      beginner/
        content.md
        images/
      intermediate/
        content.md
        images/
      advanced/
        content.md
        images/
      mirrors-and-frames/
        content.md
        images/
  repairs/
    content.md
    images/
  portfolio/              (merged: /portfolio/ + /custom-design/more-custom-photos/)
    content.md
    images/
  cabinet-doors/
    content.md
    images/
  contact/
    content.md
  manifest.json
```

Pages not included (retired, no content to carry forward):
- /services/ — no hub page on new site
- /parties/ — empty placeholder, no content
- /tool-kits/ — eliminated per client request
- /newsletter/ — no content beyond two buttons
- /helpful-links/ — only 2 links, handled manually

---

## Step 1 — Fetch Enumerated Pages

The set of pages we want is finite and known (see the URL mapping table below). Rather than mirroring the entire WordPress site (which pulls retired pages, paginated archives, theme assets, etc.), the script fetches each enumerated URL directly.

The script lives at `scripts/extract-content.js` (Node.js, uses `cheerio` for HTML parsing and the built-in `fetch` for downloads). It is **re-runnable**: it overwrites `content.md` files on each run but skips images that have already been downloaded, so iteration is cheap.

```bash
node scripts/extract-content.js
```

---

## Step 2 — Extract Content

For each enumerated URL, the script:

1. Fetches the page HTML
2. Extracts text content from `.entry-content` (the WordPress main content container used on this site) and converts it to Markdown, preserving headings, lists, links, and paragraph structure
3. Extracts all `<img>` tags within `.entry-content`, capturing `src`, `alt`, and any caption text
4. Detects the page's **featured image** (via `<meta property="og:image">`, with fallback to the first header `<img>` outside `.entry-content`) and saves it as `hero.{ext}` in that page's `images/` folder
5. Writes the text content to the appropriate `content.md`
6. Downloads the full-resolution images from the live site into the appropriate `images/` folder (see Step 4 for resolution handling)

### Content extraction per page

For each page, the `content.md` should follow this format:

```markdown
<!-- SOURCE: https://allenkenoyerglass.com/[path]/ -->
<!-- EXTRACTED: [date] -->

# [Page Title]

[raw text content from .entry-content, preserving headings and structure]

## Images
- [original-filename.jpg] — [alt text or caption if available]
- [original-filename.jpg] — [alt text or caption if available]
```

---

## Step 3 — Handle Merged Pages

The following new pages draw content from multiple existing pages. Their `content.md` files should concatenate content from all sources with clear markers:

### `/content/portfolio/content.md`
Sources:
1. `https://allenkenoyerglass.com/portfolio/`
2. `https://allenkenoyerglass.com/custom-design/more-custom-photos/`

### `/content/classes/content.md`
Sources:
1. `https://allenkenoyerglass.com/classes/`
2. `https://allenkenoyerglass.com/parties/` — *(empty on live site, note accordingly)*

### `/content/contact/content.md`
Sources:
1. `https://allenkenoyerglass.com/contact/`
2. `https://allenkenoyerglass.com/newsletter/` — *(two buttons only, note accordingly)*

### Merged file format

```markdown
<!-- SOURCE: https://allenkenoyerglass.com/portfolio/ -->
<!-- EXTRACTED: [date] -->

[content from first source]

---

<!-- SOURCE: https://allenkenoyerglass.com/custom-design/more-custom-photos/ -->

[content from second source]
```

---

## Step 4 — Image Naming and Resolution

### Full-resolution sourcing

WordPress generates multiple sized variants of every uploaded image (e.g., `lighthouse-300x200.jpg`, `lighthouse-1024x768.jpg`, plus the original `lighthouse.jpg`). The `<img src>` in rendered HTML usually points to a sized variant.

For each image, the script:

1. Parses the source URL and **strips any `-WIDTHxHEIGHT` suffix** before the extension to derive the original filename (e.g., `lighthouse-1024x768.jpg` → `lighthouse.jpg`)
2. Attempts to download the original
3. If the original returns 404, **falls back to the original `src` URL** (the sized variant) and logs a warning

This ensures we capture the largest available source so the new site can re-derive its own responsive sizes.

### Filename prefixing for merged pages

To avoid filename collisions when merging pages, prefix images with a short source slug:

- Images from `/portfolio/` → `portfolio--[original-name].jpg`
- Images from `/custom-design/more-custom-photos/` → `more-custom-photos--[original-name].jpg`
- Images from `/classes/` → `classes--[original-name].jpg`

For non-merged pages, no prefix needed — use original filenames.

### Featured (hero) images

Saved as `hero.{ext}` (e.g., `hero.jpg`) in the page's `images/` folder. Not prefixed even on merged pages — each destination page has at most one hero, drawn from the primary source.

---

## Step 5 — Generate manifest.json

After extraction, generate `/content/manifest.json` mapping every image to its source URL and destination page:

```json
[
  {
    "file": "content/portfolio/images/portfolio--lighthouse.jpg",
    "originalUrl": "https://allenkenoyerglass.com/wp-content/uploads/lighthouse.jpg",
    "sourcePage": "https://allenkenoyerglass.com/portfolio/",
    "destinationPage": "/portfolio/"
  },
  ...
]
```

---

## Known Site Details

- **CMS:** WordPress
- **Main content container:** `.entry-content`
- **Images:** Served from `/wp-content/uploads/` — full-resolution versions available at original URLs
- **Sidebar content:** Contact info, hours, related links — this is sitewide boilerplate, not page-specific content. Ignore it during extraction (it lives outside `.entry-content`)
- **Classes calendar page:** Contains only an iframe embed (Google Calendar) — no extractable text content. Note this in the content.md and move on.
- **Parties page:** Empty placeholder — no content in `.entry-content`. Note this in the content.md.

---

## Reference: Page → New URL Mapping

The **Content Folder** column is where extracted output lands under `/content/` — it mirrors the New URL.

| Existing URL | New URL | Content Folder |
|---|---|---|
| allenkenoyerglass.com/ | / | `home/` |
| allenkenoyerglass.com/custom-design/ | /custom-design/ | `custom-design/` |
| allenkenoyerglass.com/classes/ | /classes/ | `classes/` |
| allenkenoyerglass.com/classes/calendar/ | /classes/calendar/ | `classes/calendar/` |
| allenkenoyerglass.com/supplies/ | /supplies/ | `supplies/` |
| allenkenoyerglass.com/repairs/ | /repairs/ | `repairs/` |
| allenkenoyerglass.com/portfolio/ | /portfolio/ | `portfolio/` |
| allenkenoyerglass.com/custom-design/more-custom-photos/ | /portfolio/ (merged) | `portfolio/` |
| allenkenoyerglass.com/cabinet-doors/ | /cabinet-doors/ | `cabinet-doors/` |
| allenkenoyerglass.com/patterns/ | /supplies/patterns/ | `supplies/patterns/` |
| allenkenoyerglass.com/patterns/beginner/ | /supplies/patterns/beginner/ | `supplies/patterns/beginner/` |
| allenkenoyerglass.com/patterns/intermediate/ | /supplies/patterns/intermediate/ | `supplies/patterns/intermediate/` |
| allenkenoyerglass.com/patterns/advanced/ | /supplies/patterns/advanced/ | `supplies/patterns/advanced/` |
| allenkenoyerglass.com/patterns/mirrors-and-frames/ | /supplies/patterns/mirrors-and-frames/ | `supplies/patterns/mirrors-and-frames/` |
| allenkenoyerglass.com/contact/ | /contact/ | `contact/` |
| allenkenoyerglass.com/parties/ | /classes/ (merged, empty) | `classes/` |
| allenkenoyerglass.com/newsletter/ | /contact/ (merged, buttons only) | `contact/` |
