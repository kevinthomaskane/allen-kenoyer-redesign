#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const CONTENT_ROOT = path.join(REPO_ROOT, 'content');
const EXTRACTED_DATE = '2026-05-19';
const USER_AGENT =
  'allen-kenoyer-redesign content extractor (kevin@10xdev.io)';

const PAGES = [
  {
    dest: 'home',
    destUrl: '/',
    sources: [{ url: 'https://allenkenoyerglass.com/' }],
  },
  {
    dest: 'custom-design',
    destUrl: '/custom-design/',
    sources: [{ url: 'https://allenkenoyerglass.com/custom-design/' }],
  },
  {
    dest: 'classes',
    destUrl: '/classes/',
    sources: [
      {
        url: 'https://allenkenoyerglass.com/classes/',
        imagePrefix: 'classes',
        // Group images under the most recent class heading. h5s are section
        // headers (Stained Glass / Mosaic / Fused Glass / Other), h3/h4 are
        // individual class titles. Overrides correct three quirks in the
        // source HTML: holidayVotive sits under a price-as-heading, the
        // First Friday Fusing title is a <p> not a heading, and the Wind
        // Chimes h4 runs the title into the duration.
        groupImagesByHeading: {
          sectionHeadingTag: 'h5',
          classHeadingTags: 'h3, h4',
          overrides: {
            'holidayVotive2.jpg': 'Holiday Votive Holder – Intermediate Class',
            'img-02-first-friday-fusing-nights.jpg':
              'First Friday Fusing Nights',
            'img-27-fused-wind-chimes.jpg': 'Fused Wind Chimes – Intermediate',
          },
        },
        emitImageGroupsSidecar: 'image-classes.json',
        // Render images inline with each class's text (rewriting src to the
        // local saved path) instead of listing them in a separate section.
        inlineImages: true,
      },
      {
        url: 'https://allenkenoyerglass.com/parties/',
        imagePrefix: 'parties',
        note: 'Empty placeholder on live site — included for completeness.',
      },
    ],
  },
  {
    dest: 'classes/calendar',
    destUrl: '/classes/calendar/',
    sources: [
      {
        url: 'https://allenkenoyerglass.com/classes/calendar/',
        note: 'Source page is a Google Calendar iframe embed — no extractable text content.',
      },
    ],
  },
  {
    dest: 'supplies',
    destUrl: '/supplies/',
    sources: [{ url: 'https://allenkenoyerglass.com/supplies/' }],
  },
  {
    dest: 'repairs',
    destUrl: '/repairs/',
    sources: [{ url: 'https://allenkenoyerglass.com/repairs/' }],
  },
  {
    dest: 'portfolio',
    destUrl: '/portfolio/',
    sources: [
      {
        url: 'https://allenkenoyerglass.com/portfolio/',
        imagePrefix: 'portfolio',
      },
      {
        url: 'https://allenkenoyerglass.com/custom-design/more-custom-photos/',
        imagePrefix: 'more-custom-photos',
      },
    ],
  },
  {
    dest: 'cabinet-doors',
    destUrl: '/cabinet-doors/',
    sources: [{ url: 'https://allenkenoyerglass.com/cabinet-doors/' }],
  },
  {
    dest: 'supplies/patterns',
    destUrl: '/supplies/patterns/',
    sources: [{ url: 'https://allenkenoyerglass.com/patterns/' }],
  },
  {
    dest: 'supplies/patterns/beginner',
    destUrl: '/supplies/patterns/beginner/',
    sources: [{ url: 'https://allenkenoyerglass.com/patterns/beginner/' }],
  },
  {
    dest: 'supplies/patterns/intermediate',
    destUrl: '/supplies/patterns/intermediate/',
    sources: [
      { url: 'https://allenkenoyerglass.com/patterns/intermediate/' },
    ],
  },
  {
    dest: 'supplies/patterns/advanced',
    destUrl: '/supplies/patterns/advanced/',
    sources: [{ url: 'https://allenkenoyerglass.com/patterns/advanced/' }],
  },
  {
    dest: 'supplies/patterns/mirrors-and-frames',
    destUrl: '/supplies/patterns/mirrors-and-frames/',
    sources: [
      {
        url: 'https://allenkenoyerglass.com/patterns/mirrors-and-frames/',
      },
    ],
  },
  {
    dest: 'contact',
    destUrl: '/contact/',
    sources: [
      {
        url: 'https://allenkenoyerglass.com/contact/',
        imagePrefix: 'contact',
      },
      {
        url: 'https://allenkenoyerglass.com/newsletter/',
        imagePrefix: 'newsletter',
        note: 'Original page had two newsletter signup buttons only.',
      },
    ],
  },
];

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
});
turndown.remove(['script', 'style', 'noscript']);

const manifest = [];
const warnings = [];

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) {
    throw new Error(`Fetch failed: ${url} → ${res.status} ${res.statusText}`);
  }
  return res.text();
}

async function downloadBinary(url, destPath) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) {
    return { ok: false, status: res.status };
  }
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
  await fs.promises.writeFile(destPath, buf);
  return { ok: true, bytes: buf.length };
}

function stripSizeSuffix(imgUrl) {
  // /wp-content/uploads/2023/05/lighthouse-300x200.jpg → lighthouse.jpg
  return imgUrl.replace(
    /-\d+x\d+(\.[a-zA-Z0-9]+)(\?.*)?$/,
    '$1$2',
  );
}

function basenameFromUrl(imgUrl) {
  const u = new URL(imgUrl);
  return path.basename(u.pathname);
}

async function downloadImage({ originalSrc, destDir, prefix }) {
  const stripped = stripSizeSuffix(originalSrc);
  const baseName = basenameFromUrl(stripped);
  const finalName = prefix ? `${prefix}--${baseName}` : baseName;
  const destPath = path.join(destDir, finalName);

  if (fs.existsSync(destPath)) {
    return { file: destPath, sourceUrl: originalSrc, status: 'cached' };
  }

  // Try the size-stripped URL first
  let result = await downloadBinary(stripped, destPath);
  let usedUrl = stripped;
  if (!result.ok) {
    // Fallback to original src
    result = await downloadBinary(originalSrc, destPath);
    usedUrl = originalSrc;
    if (!result.ok) {
      warnings.push(
        `Image download failed: tried ${stripped} and ${originalSrc}`,
      );
      return { file: destPath, sourceUrl: originalSrc, status: 'failed' };
    }
  }

  return {
    file: destPath,
    sourceUrl: usedUrl,
    status: 'downloaded',
    bytes: result.bytes,
  };
}

function localPathForImage(originalSrc, prefix) {
  const stripped = stripSizeSuffix(originalSrc);
  const baseName = basenameFromUrl(stripped);
  const finalName = prefix ? `${prefix}--${baseName}` : baseName;
  return `images/${finalName}`;
}

function rewriteImageSrcsToLocal($, baseUrl, prefix) {
  const scope = getContentScope($);
  if (scope.length === 0) return;
  scope.find('img').each((_, el) => {
    const src = $(el).attr('src');
    if (!src) return;
    const absolute = new URL(src, baseUrl).toString();
    $(el).attr('src', localPathForImage(absolute, prefix));
    // Strip srcset/sizes so turndown doesn't carry over thumbnail URLs.
    $(el).removeAttr('srcset');
    $(el).removeAttr('sizes');
  });
}

function extractTitle($) {
  const candidates = [
    $('h1.entry-title').first().text(),
    $('.entry-title').first().text(),
    $('h1').first().text(),
    $('title').first().text(),
  ];
  for (const c of candidates) {
    const t = (c || '').trim();
    if (t) return t;
  }
  return '';
}

// The live site uses Divi's theme builder. On most pages `.entry-content`
// holds a single specialty row with a 1/3 sidebar column (Contact / Hours
// boilerplate, sitewide) and a 2/3 `.et_pb_specialty_column` with the actual
// page content. When that column exists, use it as the scope so the sidebar
// is excluded. Otherwise fall back to `.entry-content` whole.
function getContentScope($) {
  const specialty = $('.entry-content .et_pb_specialty_column').first();
  if (specialty.length > 0) return specialty;
  return $('.entry-content').first();
}

function collectEntryImages($, baseUrl, groupConfig) {
  const scope = getContentScope($);
  if (scope.length === 0) return [];
  const sectionTag = groupConfig?.sectionHeadingTag;
  const classTagSelector = groupConfig?.classHeadingTags;
  const overrides = groupConfig?.overrides || {};

  // Walk descendants in document order. cheerio's .find() preserves order.
  const selectors = ['img'];
  if (sectionTag) selectors.push(sectionTag);
  if (classTagSelector) selectors.push(classTagSelector);
  const walkSelector = selectors.join(', ');

  const images = [];
  let currentSection = null;
  let currentClass = null;

  const classTags = classTagSelector
    ? classTagSelector.split(',').map((s) => s.trim())
    : [];

  scope.find(walkSelector).each((_, el) => {
    const tag = el.tagName.toLowerCase();
    if (sectionTag && tag === sectionTag) {
      // Divi emits empty heading tags as visual spacers — ignore them so
      // they don't overwrite the real heading we're tracking.
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (!text) return;
      currentSection = text;
      currentClass = null;
      return;
    }
    if (classTags.includes(tag)) {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (!text) return;
      currentClass = text;
      return;
    }
    if (tag === 'img') {
      const src = $(el).attr('src');
      if (!src) return;
      const alt = ($(el).attr('alt') || '').trim();
      const absolute = new URL(src, baseUrl).toString();
      const originalBasename = basenameFromUrl(stripSizeSuffix(absolute));
      const overrideClass = overrides[originalBasename];
      images.push({
        src: absolute,
        alt,
        section: currentSection,
        class: overrideClass || currentClass,
      });
    }
  });
  return images;
}

function extractEntryMarkdown($, { keepImages = false } = {}) {
  const scope = getContentScope($);
  if (scope.length === 0) return { markdown: '', html: '' };
  if (!keepImages) {
    // Strip images from the markdown body — they're listed separately
    scope.find('img').remove();
  }
  // Strip empty wrapper paragraphs left behind
  scope.find('p').each((_, el) => {
    if (
      !$(el).text().trim() &&
      $(el).find('img, iframe, video').length === 0
    ) {
      $(el).remove();
    }
  });
  const html = scope.html() || '';
  const markdown = turndown.turndown(html).trim();
  return { markdown, html };
}

function findFeaturedImageUrl($, fallbackBaseUrl) {
  // Only use explicit Open Graph / Twitter Card tags. Falling back to
  // header <img> grabs the site logo, which isn't a per-page hero.
  const og = $('meta[property="og:image"]').attr('content');
  if (og) return new URL(og, fallbackBaseUrl).toString();
  const tw = $('meta[name="twitter:image"]').attr('content');
  if (tw) return new URL(tw, fallbackBaseUrl).toString();
  return null;
}

async function processSource({ source, destDir, isMerged }) {
  console.log(`  fetching ${source.url}`);
  const html = await fetchText(source.url);
  const $ = cheerio.load(html);
  const title = extractTitle($);
  // Collect image URLs BEFORE extractEntryMarkdown — it strips <img> nodes
  // (unless inlineImages is set, in which case we keep them and rewrite src).
  const entryImages = collectEntryImages(
    $,
    source.url,
    source.groupImagesByHeading,
  );
  const featuredUrl = findFeaturedImageUrl($, source.url);
  const prefix = isMerged ? source.imagePrefix : null;
  if (source.inlineImages) {
    rewriteImageSrcsToLocal($, source.url, prefix);
  }
  const { markdown } = extractEntryMarkdown($, {
    keepImages: !!source.inlineImages,
  });

  const imagesDir = path.join(destDir, 'images');
  if (entryImages.length > 0 || featuredUrl) {
    await fs.promises.mkdir(imagesDir, { recursive: true });
  }

  const downloadedImages = [];
  for (const img of entryImages) {
    const result = await downloadImage({
      originalSrc: img.src,
      destDir: imagesDir,
      prefix,
    });
    downloadedImages.push({
      ...result,
      alt: img.alt,
      originalSrc: img.src,
      section: img.section || null,
      class: img.class || null,
    });
  }

  // Featured (hero) image — first source's hero wins; later sources skip
  // if a hero already exists (so merged pages don't overwrite).
  let heroResult = null;
  if (featuredUrl) {
    const ext =
      path.extname(new URL(featuredUrl).pathname).toLowerCase() || '.jpg';
    const heroPath = path.join(imagesDir, `hero${ext}`);
    if (fs.existsSync(heroPath)) {
      heroResult = {
        file: heroPath,
        sourceUrl: featuredUrl,
        status: 'cached',
      };
    } else {
      const stripped = stripSizeSuffix(featuredUrl);
      let r = await downloadBinary(stripped, heroPath);
      let usedUrl = stripped;
      if (!r.ok) {
        r = await downloadBinary(featuredUrl, heroPath);
        usedUrl = featuredUrl;
      }
      if (r.ok) {
        heroResult = {
          file: heroPath,
          sourceUrl: usedUrl,
          status: 'downloaded',
        };
      } else {
        warnings.push(
          `Hero image failed for ${source.url}: tried ${stripped} and ${featuredUrl}`,
        );
      }
    }
  }

  return { title, markdown, downloadedImages, heroResult };
}

function relForManifest(absPath) {
  return path.relative(REPO_ROOT, absPath);
}

function renderContentMd({ sourceResults }) {
  const blocks = [];

  sourceResults.forEach((result, idx) => {
    const { source, title, markdown, downloadedImages, heroResult } = result;
    const lines = [];
    lines.push(`<!-- SOURCE: ${source.url} -->`);
    if (idx === 0) lines.push(`<!-- EXTRACTED: ${EXTRACTED_DATE} -->`);
    lines.push('');
    if (source.note) {
      lines.push(`> **Note:** ${source.note}`);
      lines.push('');
    }
    if (title) {
      lines.push(`# ${title}`);
      lines.push('');
    }
    if (markdown) {
      lines.push(markdown);
      lines.push('');
    } else {
      lines.push('_No text content extracted from `.entry-content`._');
      lines.push('');
    }
    // Inline sources embed images directly in the body — skip the trailing
    // list to avoid duplication.
    const skipImagesSection = !!source.inlineImages;
    if (
      !skipImagesSection &&
      (heroResult || downloadedImages.length > 0)
    ) {
      lines.push('## Images');
      if (heroResult) {
        lines.push(
          `- \`${path.basename(heroResult.file)}\` — featured / hero image`,
        );
      }
      // If this source used groupImagesByHeading, render images bucketed
      // under their section + class headings. Otherwise flat list.
      const grouped = !!source.groupImagesByHeading;
      if (grouped) {
        const bySection = new Map();
        for (const img of downloadedImages) {
          const sec = img.section || '(no section)';
          const cls = img.class || '(unassigned)';
          if (!bySection.has(sec)) bySection.set(sec, new Map());
          const byClass = bySection.get(sec);
          if (!byClass.has(cls)) byClass.set(cls, []);
          byClass.get(cls).push(img);
        }
        for (const [section, byClass] of bySection) {
          lines.push('');
          lines.push(`### ${section}`);
          for (const [cls, imgs] of byClass) {
            lines.push('');
            lines.push(`**${cls}**`);
            for (const img of imgs) {
              const name = path.basename(img.file);
              const caption = img.alt ? ` — ${img.alt}` : '';
              lines.push(`- \`${name}\`${caption}`);
            }
          }
        }
      } else {
        for (const img of downloadedImages) {
          const name = path.basename(img.file);
          const caption = img.alt ? ` — ${img.alt}` : '';
          lines.push(`- \`${name}\`${caption}`);
        }
      }
      lines.push('');
    }
    blocks.push(lines.join('\n').trimEnd());
  });

  return blocks.join('\n\n---\n\n') + '\n';
}

async function processPage(page) {
  console.log(`\n[${page.dest}]`);
  const destDir = path.join(CONTENT_ROOT, page.dest);
  await fs.promises.mkdir(destDir, { recursive: true });

  const isMerged = page.sources.length > 1;
  const sourceResults = [];

  for (const source of page.sources) {
    try {
      const result = await processSource({ source, destDir, isMerged });
      sourceResults.push({ source, ...result });

      // Manifest entries
      for (const img of result.downloadedImages) {
        if (img.status === 'failed') continue;
        const entry = {
          file: relForManifest(img.file),
          originalUrl: img.originalSrc,
          downloadedFrom: img.sourceUrl,
          sourcePage: source.url,
          destinationPage: page.destUrl,
          alt: img.alt || null,
        };
        if (img.section) entry.section = img.section;
        if (img.class) entry.class = img.class;
        manifest.push(entry);
      }

      // Optional per-source sidecar (e.g., classes page image-to-class map)
      if (source.emitImageGroupsSidecar) {
        const sidecar = result.downloadedImages
          .filter((img) => img.status !== 'failed')
          .map((img) => ({
            file: path.basename(img.file),
            section: img.section || null,
            class: img.class || null,
            alt: img.alt || null,
          }));
        await fs.promises.writeFile(
          path.join(destDir, source.emitImageGroupsSidecar),
          JSON.stringify(sidecar, null, 2) + '\n',
        );
      }
      if (result.heroResult && result.heroResult.status !== 'failed') {
        manifest.push({
          file: relForManifest(result.heroResult.file),
          originalUrl: result.heroResult.sourceUrl,
          downloadedFrom: result.heroResult.sourceUrl,
          sourcePage: source.url,
          destinationPage: page.destUrl,
          role: 'hero',
        });
      }
    } catch (err) {
      warnings.push(`Source failed: ${source.url} — ${err.message}`);
      sourceResults.push({
        source,
        title: '',
        markdown: '',
        downloadedImages: [],
        heroResult: null,
        error: err.message,
      });
    }
  }

  const md = renderContentMd({ sourceResults });
  await fs.promises.writeFile(path.join(destDir, 'content.md'), md);
}

async function main() {
  await fs.promises.mkdir(CONTENT_ROOT, { recursive: true });
  for (const page of PAGES) {
    await processPage(page);
  }
  await fs.promises.writeFile(
    path.join(CONTENT_ROOT, 'manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
  );
  console.log(`\nDone. ${manifest.length} image entries in manifest.json.`);
  if (warnings.length > 0) {
    console.log(`\n${warnings.length} warning(s):`);
    for (const w of warnings) console.log(`  - ${w}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
