// One-shot script: upload every image under content/<slug>/images/ to the
// Supabase Storage `site-images` bucket. Idempotent — safe to re-run.
// Patterns are intentionally excluded (ADR-0017 keeps them in /public/).
//
// Run from the repo root with the env file containing the secret key:
//   pnpm migrate:images
//
// Required env (in .env.local at repo root):
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SECRET_KEY (sb_secret_*, NOT a NEXT_PUBLIC_ var)

import { createClient } from "@supabase/supabase-js";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, extname } from "node:path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const BUCKET = "site-images";

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY. Make sure .env.local is configured and you ran via `pnpm migrate:images` (which passes --env-file)."
  );
  process.exit(1);
}

// Slugs to migrate. Patterns deliberately excluded (ADR-0017 keeps them in /public/).
const SLUGS = [
  "cabinet-doors",
  "classes",
  "contact",
  "custom-design",
  "home",
  "portfolio",
  "repairs",
  "supplies",
];

const CONTENT_TYPE_BY_EXT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

const IMAGE_EXTS = new Set(Object.keys(CONTENT_TYPE_BY_EXT));

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

async function walkImages(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walkImages(path)));
    } else if (entry.isFile() && IMAGE_EXTS.has(extname(entry.name).toLowerCase())) {
      out.push(path);
    }
  }
  return out;
}

async function uploadOne(localPath, bucketPath) {
  const buf = await readFile(localPath);
  const contentType = CONTENT_TYPE_BY_EXT[extname(localPath).toLowerCase()];
  const { error } = await supabase.storage.from(BUCKET).upload(bucketPath, buf, {
    contentType,
    upsert: true,
    cacheControl: "31536000",
  });
  return error;
}

async function main() {
  const repoRoot = process.cwd();
  const contentRoot = join(repoRoot, "content");

  let total = 0;
  let success = 0;
  const failures = [];

  for (const slug of SLUGS) {
    const slugDir = join(contentRoot, slug, "images");
    let exists = false;
    try {
      const s = await stat(slugDir);
      exists = s.isDirectory();
    } catch {
      // missing dir — skip
    }
    if (!exists) {
      console.log(`[${slug}] no images/ directory, skipping`);
      continue;
    }

    const files = await walkImages(slugDir);
    console.log(`[${slug}] ${files.length} image(s)`);

    for (const file of files) {
      total++;
      const rel = relative(slugDir, file);
      const bucketPath = `${slug}/${rel}`.split("\\").join("/"); // safe on win
      const err = await uploadOne(file, bucketPath);
      if (err) {
        failures.push({ bucketPath, message: err.message });
        process.stdout.write(`  x ${bucketPath} — ${err.message}\n`);
      } else {
        success++;
        process.stdout.write(`  + ${bucketPath}\n`);
      }
    }
  }

  console.log();
  console.log(`Done. Uploaded ${success}/${total}.`);
  if (failures.length > 0) {
    console.log(`Failures (${failures.length}):`);
    for (const f of failures) console.log(`  ${f.bucketPath}: ${f.message}`);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
