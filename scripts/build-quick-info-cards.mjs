#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const REQUIRED = process.env.CI === 'true' || process.env.QUICK_INFO_CARDS_REQUIRED === 'true';
const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const LIST_WIDTH = 640;
const LIST_HEIGHT = 336;
const CARD_DIR = join(process.cwd(), 'public', 'quick-info', 'cards');
const OG_DIR = join(process.cwd(), 'public', 'quick-info', 'og');
const MANIFEST_PATH = join(process.cwd(), 'public', 'quick-info', 'cards-manifest.json');
const TMP_ROOT = join(tmpdir(), `rawafid-quick-info-cards-${process.pid}`);
let IMAGE_COMMAND = '';

function failOrSkip(message) {
  if (REQUIRED) throw new Error(message);
  console.warn(`[quick-info-cards] ${message} Skipping outside CI.`);
  process.exit(0);
}

function commandResult(command, args) {
  return spawnSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function commandWorks(command, probeArgs) {
  const result = commandResult(command, probeArgs);
  return !result.error && result.status === 0;
}

function selectImageMagickCommand() {
  if (commandWorks('magick', ['-version'])) return 'magick';
  if (commandWorks('convert', ['-version'])) return 'convert';
  failOrSkip('ImageMagick is required for deterministic static WebP generation.');
  return '';
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (result.error || result.status !== 0) {
    throw new Error(`${command} failed: ${result.stderr || result.error?.message || 'unknown error'}`);
  }
  return result;
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function isPublicationApproved(schema) {
  return Boolean(
    schema
    && typeof schema === 'object'
    && !Array.isArray(schema)
    && schema.page_role === 'quick-info'
    && schema.publication_ready === true
    && schema.editorial_review_required === false,
  );
}

function routeSlug(contentSlug) {
  const value = String(contentSlug || '');
  if (!value.startsWith('quick-info-')) return '';
  const slug = value.slice('quick-info-'.length);
  return /^[a-z0-9][a-z0-9-]*$/.test(slug) ? slug : '';
}

function wrapArabicTitle(title, maxChars = 28, maxLines = 3) {
  const words = String(title || '').trim().split(/\s+/u).filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars || !current) {
      current = candidate;
      continue;
    }
    lines.push(current);
    current = word;
  }
  if (current) lines.push(current);

  if (lines.length <= maxLines) return lines;

  const balanced = [];
  const target = Math.ceil(String(title).length / maxLines);
  current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (balanced.length < maxLines - 1 && current && candidate.length > Math.max(target, maxChars)) {
      balanced.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) balanced.push(current);
  return balanced.slice(0, maxLines);
}

async function loadPublishedQuickInfo() {
  if (!SUPABASE_URL || !SUPABASE_KEY) failOrSkip('Supabase public build credentials are required.');
  const url = new URL(`${SUPABASE_URL}/rest/v1/content`);
  url.searchParams.set('select', 'slug,title,canonical_url,schema_json');
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
  if (!response.ok) throw new Error(`Quick Info build query failed (${response.status}): ${await response.text()}`);
  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error('Quick Info build query returned a non-array payload.');

  const items = rows.flatMap((row) => {
    const slug = routeSlug(row?.slug);
    const title = typeof row?.title === 'string' ? row.title.trim() : '';
    const canonical = typeof row?.canonical_url === 'string' ? row.canonical_url.trim() : '';
    if (!slug || !title || !isPublicationApproved(row?.schema_json)) return [];
    if (canonical && canonical !== `/quick-info/${slug}/`) return [];
    return [{ slug, title }];
  });
  if (!items.length) throw new Error('No publication-approved Quick Info records were returned.');
  return items;
}

function buildSvg(title) {
  const titleLines = wrapArabicTitle(title);
  const titleSize = title.length > 67 ? 44 : title.length > 56 ? 47 : 51;
  const titleStartY = titleLines.length === 1 ? 330 : titleLines.length === 2 ? 292 : 258;
  const lineHeight = 72;
  const titleTspans = titleLines.map((line, index) => (
    `<tspan x="1092" y="${titleStartY + index * lineHeight}">${escapeXml(line)}</tspan>`
  )).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" xml:lang="ar">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f4faf8"/>
      <stop offset="1" stop-color="#f8f6ed"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1110" cy="60" r="160" fill="#e3f1ef"/>
  <circle cx="120" cy="590" r="160" fill="#f3f2e8"/>
  <rect x="64" y="54" width="1072" height="522" rx="34" fill="#ffffff" stroke="#d8e8e5" stroke-width="1"/>

  <g font-family="Noto Sans Arabic, Noto Sans, sans-serif" direction="rtl" unicode-bidi="plaintext" text-anchor="end">
    <text x="1092" y="126" font-size="40" font-weight="700" fill="#123b3c">روافد</text>
    <text x="1092" y="164" font-size="20" font-weight="500" fill="#36545a">منصة المعرفة العربية الموثوقة</text>
    <text font-size="${titleSize}" font-weight="700" fill="#102f36">${titleTspans}</text>
    <text x="1092" y="500" font-size="24" font-weight="500" fill="#31595b">معلومة سريعة · قراءة عربية واضحة · منصة روافد</text>
  </g>
  <text x="1092" y="548" font-family="Noto Sans, sans-serif" font-size="20" font-weight="500" fill="#4f7172" text-anchor="end">healthrenewal.org</text>
</svg>`;
}

async function createCard(item) {
  const temp = join(TMP_ROOT, item.slug);
  await mkdir(temp, { recursive: true });
  const svgPath = join(temp, 'card.svg');
  const og = join(OG_DIR, `${item.slug}.png`);
  const card = join(CARD_DIR, `${item.slug}.webp`);
  await writeFile(svgPath, buildSvg(item.title), 'utf8');

  run('rsvg-convert', ['--width', String(CARD_WIDTH), '--height', String(CARD_HEIGHT), '--format', 'png', '--output', og, svgPath]);
  run(IMAGE_COMMAND, [og, '-resize', `${LIST_WIDTH}x${LIST_HEIGHT}!`, '-strip', '-quality', '82', card]);

  const [ogStat, cardStat] = await Promise.all([stat(og), stat(card)]);
  if (!ogStat.size || !cardStat.size) throw new Error(`Generated empty card asset for ${item.slug}.`);
  return { slug: item.slug, title: item.title, og: `/quick-info/og/${item.slug}.png`, card: `/quick-info/cards/${item.slug}.webp` };
}

async function main() {
  IMAGE_COMMAND = selectImageMagickCommand();
  if (!commandWorks('rsvg-convert', ['--version'])) failOrSkip('librsvg rsvg-convert is required for deterministic Arabic rasterization.');
  if (!commandWorks('fc-match', ['Noto Sans Arabic'])) failOrSkip('fontconfig with Noto Sans Arabic is required.');
  const fontCheck = commandResult('fc-match', ['-f', '%{family}', 'Noto Sans Arabic']);
  if (!/Noto Sans Arabic/i.test(fontCheck.stdout || '')) failOrSkip('Noto Sans Arabic was not resolved by fontconfig.');

  const items = await loadPublishedQuickInfo();
  await rm(CARD_DIR, { recursive: true, force: true });
  await rm(OG_DIR, { recursive: true, force: true });
  await rm(TMP_ROOT, { recursive: true, force: true });
  await mkdir(CARD_DIR, { recursive: true });
  await mkdir(OG_DIR, { recursive: true });
  await mkdir(TMP_ROOT, { recursive: true });

  const manifest = [];
  for (const [index, item] of items.entries()) {
    manifest.push(await createCard(item));
    if ((index + 1) % 25 === 0 || index + 1 === items.length) {
      console.log(`[quick-info-cards] generated ${index + 1}/${items.length}`);
    }
  }

  await writeFile(MANIFEST_PATH, `${JSON.stringify({ version: 2, generatedAt: new Date().toISOString(), count: manifest.length, items: manifest }, null, 2)}\n`, 'utf8');
  await rm(TMP_ROOT, { recursive: true, force: true });
  console.log(`[quick-info-cards] ready: ${manifest.length} static RTL cards; one Supabase REST read, zero runtime image API calls.`);
}

main().catch((error) => {
  console.error('[quick-info-cards]', error);
  process.exitCode = 1;
});
