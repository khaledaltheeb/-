#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { mkdir, rm, stat, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const REQUIRED = process.env.CI === 'true' || process.env.QUICK_INFO_SOCIAL_IMAGES_REQUIRED === 'true';
const OG_DIR = join(process.cwd(), 'public', 'quick-info', 'og');
const MANIFEST = join(process.cwd(), 'public', 'quick-info', 'social-images-manifest.json');
const TMP = join(tmpdir(), `rawafid-qi-${process.pid}`);
const PROFILES = JSON.parse(await readFile(join(process.cwd(), 'data', 'quick-info-visuals.json'), 'utf8'));
const LOGO_MARK = await readFile(join(process.cwd(), 'public', 'assets', 'brand', 'logo-mark.svg'), 'utf8');
const LOGO_DATA = `data:image/svg+xml;base64,${Buffer.from(LOGO_MARK, 'utf8').toString('base64')}`;
const DEFAULT = PROFILES.find((p) => p.id === 'general') || PROFILES[0];

const CARD_RIGHT = 1082;
const BRAND_TEXT_RIGHT = 966;
const SAFE_LEFT = 92;
const TITLE_LINE_HEIGHT = 64;
const EXCERPT_LINE_HEIGHT = 38;
const EXCERPT_FONT_SIZE = 24;
const SITE_URL_FONT_SIZE = 21;
const SITE_URL_LABEL = 'https://healthrenewal.org';

const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (r.error || r.status !== 0) {
    throw new Error(`${cmd} failed: ${r.stderr || r.error?.message || 'unknown error'}`);
  }
  return r;
};

const esc = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const norm = (value) => String(value || '')
  .normalize('NFKC')
  .toLocaleLowerCase('ar')
  .replace(/[أإآ]/gu, 'ا')
  .replace(/ؤ/gu, 'و')
  .replace(/ئ/gu, 'ي')
  .replace(/ى/gu, 'ي')
  .replace(/ة/gu, 'ه')
  .replace(/[\u064B-\u065F\u0670]/gu, '')
  .replace(/\s+/gu, ' ')
  .trim();

const profileFor = (title) => PROFILES.find(
  (p) => p.id !== 'general' && p.keywords.some((keyword) => norm(title).includes(norm(keyword))),
) || DEFAULT;

const approved = (schema) => Boolean(
  schema
  && typeof schema === 'object'
  && !Array.isArray(schema)
  && schema.page_role === 'quick-info'
  && schema.publication_ready === true
  && schema.editorial_review_required === false,
);

const routeSlug = (slug) => (
  String(slug || '').startsWith('quick-info-')
  && /^[a-z0-9][a-z0-9-]*$/.test(String(slug).slice(11))
    ? String(slug).slice(11)
    : ''
);

const imageAlt = (item) => `بطاقة معلومات سريعة من منصة روافد بعنوان «${item.title}»`;

function wrap(value, maxChars, maxLines) {
  const out = [];
  let row = '';
  for (const word of String(value || '').trim().split(/\s+/u).filter(Boolean)) {
    const next = row ? `${row} ${word}` : word;
    if (!row || next.length <= maxChars) row = next;
    else {
      out.push(row);
      row = word;
    }
  }
  if (row) out.push(row);
  if (out.length <= maxLines) return out;
  const cut = out.slice(0, maxLines);
  cut[maxLines - 1] = `${cut[maxLines - 1].replace(/[.…]+$/u, '')}…`;
  return cut;
}

async function load() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    if (REQUIRED) throw new Error('Supabase public build credentials are required.');
    return [];
  }

  const url = new URL(`${SUPABASE_URL}/rest/v1/content`);
  url.searchParams.set('select', 'slug,title,excerpt,canonical_url,schema_json');
  url.searchParams.set('slug', 'like.quick-info-*');
  url.searchParams.set('status', 'eq.published');
  url.searchParams.set('robots_index', 'eq.true');
  url.searchParams.set('published_at', `lte.${new Date().toISOString()}`);
  url.searchParams.set('order', 'title.asc');
  url.searchParams.set('limit', '500');

  const response = await fetch(url, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: 'application/json',
    },
  });
  if (!response.ok) throw new Error(`Quick Info social image query failed (${response.status})`);

  const rows = await response.json();
  const items = rows.flatMap((row) => {
    const slug = routeSlug(row?.slug);
    const title = String(row?.title || '').trim();
    const excerpt = String(row?.excerpt || '').trim();
    const canonical = String(row?.canonical_url || '').trim();
    return slug
      && title
      && approved(row?.schema_json)
      && (!canonical || canonical === `/quick-info/${slug}/`)
      ? [{ slug, title, excerpt }]
      : [];
  });

  if (REQUIRED && !items.length) throw new Error('No publication-approved Quick Info records were returned.');
  return items;
}

function svg(item) {
  const profile = profileFor(item.title);
  const titleLines = wrap(item.title, 28, 3);
  const excerptLines = wrap(item.excerpt, 54, 2);
  const titleSize = item.title.length > 88 ? 38 : item.title.length > 72 ? 42 : item.title.length > 56 ? 47 : 53;
  const titleStart = titleLines.length === 1 ? 320 : titleLines.length === 2 ? 280 : 238;
  const excerptStart = titleStart + titleLines.length * TITLE_LINE_HEIGHT + 32;

  const titleSpans = titleLines.map(
    (line, index) => `<tspan x="${CARD_RIGHT}" y="${titleStart + index * TITLE_LINE_HEIGHT}">${esc(line)}</tspan>`,
  ).join('');
  const excerptSpans = excerptLines.map(
    (line, index) => `<tspan x="${CARD_RIGHT}" y="${excerptStart + index * EXCERPT_LINE_HEIGHT}">${esc(line)}</tspan>`,
  ).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" xml:lang="ar">
  <defs>
    <linearGradient id="bg"><stop stop-color="${profile.glow}"/><stop offset="1" stop-color="#fffaf1"/></linearGradient>
    <clipPath id="safe-content"><rect x="${SAFE_LEFT}" y="66" width="${CARD_RIGHT - SAFE_LEFT}" height="500"/></clipPath>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="52" y="42" width="1096" height="546" rx="38" fill="#fff" stroke="#d8e8e5"/>
  <g clip-path="url(#safe-content)" font-family="Noto Sans Arabic, Noto Sans, sans-serif">
    <image href="${LOGO_DATA}" x="989" y="76" width="78" height="78" preserveAspectRatio="xMidYMid meet"/>
    <g direction="rtl" unicode-bidi="plaintext" text-anchor="start">
      <text x="${BRAND_TEXT_RIGHT}" y="105" font-size="31" font-weight="750" fill="#123b3c">منصة روافد</text>
      <text x="${BRAND_TEXT_RIGHT}" y="140" font-size="18" fill="#5d7479">معرفة عربية موثوقة</text>
      <rect x="878" y="174" width="204" height="48" rx="24" fill="#eef7f5"/>
      <text x="1054" y="207" font-size="19" font-weight="700" fill="#315d61">معلومات سريعة</text>
      <rect x="600" y="174" width="260" height="48" rx="24" fill="${profile.soft}"/>
      <text x="832" y="207" font-size="19" font-weight="700" fill="${profile.accentDark}">${esc(profile.label)}</text>
      <text font-size="${titleSize}" font-weight="780" fill="#102f36">${titleSpans}</text>
      ${excerptSpans ? `<text font-size="${EXCERPT_FONT_SIZE}" fill="#506a70">${excerptSpans}</text>` : ''}
    </g>
    <text x="${CARD_RIGHT}" y="548" direction="ltr" unicode-bidi="plaintext" text-anchor="end" font-size="${SITE_URL_FONT_SIZE}" font-weight="700" fill="${profile.accentDark}">${SITE_URL_LABEL}</text>
  </g>
</svg>`;
}

async function main() {
  run('rsvg-convert', ['--version']);
  run('fc-match', ['Noto Sans Arabic']);

  const items = await load();
  if (!items.length) return;

  await rm(OG_DIR, { recursive: true, force: true });
  await rm(TMP, { recursive: true, force: true });
  await mkdir(OG_DIR, { recursive: true });
  await mkdir(TMP, { recursive: true });

  const manifest = [];
  for (const item of items) {
    const src = join(TMP, `${item.slug}.svg`);
    const dst = join(OG_DIR, `${item.slug}.png`);
    await writeFile(src, svg(item), 'utf8');
    run('rsvg-convert', ['--width', '1200', '--height', '630', '--format', 'png', '--output', dst, src]);
    if (!(await stat(dst)).size) throw new Error(`Empty image: ${item.slug}`);
    manifest.push({
      slug: item.slug,
      title: item.title,
      topic: profileFor(item.title).id,
      image: `/quick-info/og/${item.slug}.png`,
      alt: imageAlt(item),
      width: 1200,
      height: 630,
    });
  }

  await writeFile(MANIFEST, `${JSON.stringify({ version: 8, generatedAt: new Date().toISOString(), count: manifest.length, items: manifest }, null, 2)}\n`);
  await rm(TMP, { recursive: true, force: true });
  console.log(`[quick-info-social] ready: ${manifest.length} indexable card images with official Rawafid branding, readable excerpt sizing, canonical site URL, and RTL-safe text alignment.`);
}

main().catch((error) => {
  console.error('[quick-info-social]', error);
  process.exitCode = 1;
});
