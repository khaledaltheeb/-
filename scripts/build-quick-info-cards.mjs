#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { mkdir, rm, stat, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const REQUIRED = process.env.CI === 'true' || process.env.QUICK_INFO_SOCIAL_IMAGES_REQUIRED === 'true';
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OG_DIR = join(process.cwd(), 'public', 'quick-info', 'og');
const MANIFEST_PATH = join(process.cwd(), 'public', 'quick-info', 'social-images-manifest.json');
const TMP_ROOT = join(tmpdir(), `rawafid-quick-info-social-${process.pid}`);
const profilePath = join(process.cwd(), 'data', 'quick-info-visuals.json');
const PROFILES = JSON.parse(await readFile(profilePath, 'utf8'));
const DEFAULT_PROFILE = PROFILES.find((profile) => profile.id === 'general') || PROFILES[0];

function failOrSkip(message) {
  if (REQUIRED) throw new Error(message);
  console.warn(`[quick-info-social] ${message} Skipping outside CI.`);
  process.exit(0);
}

function commandResult(command, args) {
  return spawnSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function commandWorks(command, probeArgs) {
  const result = commandResult(command, probeArgs);
  return !result.error && result.status === 0;
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (result.error || result.status !== 0) throw new Error(`${command} failed: ${result.stderr || result.error?.message || 'unknown error'}`);
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

function normalizeArabic(value) {
  return String(value || '')
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
}

function profileFor(title) {
  const normalized = normalizeArabic(title);
  return PROFILES.find((profile) => profile.id !== 'general' && profile.keywords.some((keyword) => normalized.includes(normalizeArabic(keyword)))) || DEFAULT_PROFILE;
}

function isPublicationApproved(schema) {
  return Boolean(schema && typeof schema === 'object' && !Array.isArray(schema) && schema.page_role === 'quick-info' && schema.publication_ready === true && schema.editorial_review_required === false);
}

function routeSlug(contentSlug) {
  const value = String(contentSlug || '');
  if (!value.startsWith('quick-info-')) return '';
  const slug = value.slice('quick-info-'.length);
  return /^[a-z0-9][a-z0-9-]*$/.test(slug) ? slug : '';
}

function wrapArabic(value, maxChars, maxLines) {
  const words = String(value || '').trim().split(/\s+/u).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || candidate.length <= maxChars) current = candidate;
    else { lines.push(current); current = word; }
  }
  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;
  const clipped = lines.slice(0, maxLines);
  clipped[maxLines - 1] = `${clipped[maxLines - 1].replace(/[.…]+$/u, '')}…`;
  return clipped;
}

async function loadPublishedQuickInfo() {
  if (!SUPABASE_URL || !SUPABASE_KEY) failOrSkip('Supabase public build credentials are required.');
  const url = new URL(`${SUPABASE_URL}/rest/v1/content`);
  url.searchParams.set('select', 'slug,title,excerpt,canonical_url,schema_json');
  url.searchParams.set('slug', 'like.quick-info-*');
  url.searchParams.set('status', 'eq.published');
  url.searchParams.set('robots_index', 'eq.true');
  url.searchParams.set('published_at', `lte.${new Date().toISOString()}`);
  url.searchParams.set('order', 'title.asc');
  url.searchParams.set('limit', '500');

  const response = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, Accept: 'application/json' } });
  if (!response.ok) throw new Error(`Quick Info social image query failed (${response.status}): ${await response.text()}`);
  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error('Quick Info social image query returned a non-array payload.');
  const items = rows.flatMap((row) => {
    const slug = routeSlug(row?.slug);
    const title = typeof row?.title === 'string' ? row.title.trim() : '';
    const excerpt = typeof row?.excerpt === 'string' ? row.excerpt.trim() : '';
    const canonical = typeof row?.canonical_url === 'string' ? row.canonical_url.trim() : '';
    if (!slug || !title || !isPublicationApproved(row?.schema_json)) return [];
    if (canonical && canonical !== `/quick-info/${slug}/`) return [];
    return [{ slug, title, excerpt }];
  });
  if (!items.length) throw new Error('No publication-approved Quick Info records were returned.');
  return items;
}

function buildSvg(item) {
  const profile = profileFor(item.title);
  const titleLines = wrapArabic(item.title, 30, 3);
  const excerptLines = wrapArabic(item.excerpt, 62, 2);
  const titleSize = item.title.length > 72 ? 42 : item.title.length > 56 ? 47 : 53;
  const titleStart = titleLines.length === 1 ? 320 : titleLines.length === 2 ? 282 : 246;
  const titleSpans = titleLines.map((line, index) => `<tspan x="1082" y="${titleStart + index * 70}">${escapeXml(line)}</tspan>`).join('');
  const excerptStart = titleStart + titleLines.length * 70 + 24;
  const excerptSpans = excerptLines.map((line, index) => `<tspan x="1082" y="${excerptStart + index * 34}">${escapeXml(line)}</tspan>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}" xml:lang="ar">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${profile.glow}"/><stop offset="1" stop-color="#fffaf1"/></linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#123b3c" flood-opacity="0.09"/></filter>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1120" cy="65" r="185" fill="${profile.soft}" opacity=".96"/>
  <circle cx="92" cy="574" r="176" fill="#f2eee2" opacity=".88"/>
  <rect x="52" y="42" width="1096" height="546" rx="38" fill="#fff" stroke="#d8e8e5" filter="url(#shadow)"/>
  <rect x="989" y="76" width="78" height="78" rx="22" fill="${profile.accentDark}"/>
  <text x="1028" y="132" font-family="Noto Sans Arabic, Noto Sans, sans-serif" font-size="42" font-weight="800" fill="#fff" text-anchor="middle">ر</text>
  <g font-family="Noto Sans Arabic, Noto Sans, sans-serif" direction="rtl" unicode-bidi="plaintext" text-anchor="end">
    <text x="966" y="105" font-size="31" font-weight="750" fill="#123b3c">منصة روافد</text>
    <text x="966" y="140" font-size="18" font-weight="500" fill="#5d7479">معرفة عربية موثوقة</text>
    <rect x="820" y="174" width="262" height="48" rx="24" fill="${profile.soft}"/>
    <text x="1054" y="207" font-size="19" font-weight="700" fill="${profile.accentDark}">${escapeXml(profile.label)}</text>
    <text font-size="${titleSize}" font-weight="780" fill="#102f36">${titleSpans}</text>
    ${excerptLines.length ? `<text font-size="20" font-weight="450" fill="#506a70">${excerptSpans}</text>` : ''}
    <text x="1082" y="548" font-size="19" font-weight="700" fill="${profile.accentDark}">healthrenewal.org</text>
  </g>
  <g opacity=".9">
    <circle cx="206" cy="240" r="92" fill="${profile.soft}"/>
    <circle cx="206" cy="240" r="54" fill="none" stroke="${profile.accent}" stroke-width="14"/>
    <circle cx="184" cy="222" r="8" fill="${profile.accentDark}"/><circle cx="228" cy="222" r="8" fill="${profile.accentDark}"/><circle cx="206" cy="261" r="8" fill="${profile.accentDark}"/>
  </g>
</svg>`;
}

async function createSocialImage(item) {
  const temp = join(TMP_ROOT, item.slug);
  await mkdir(temp, { recursive: true });
  const svgPath = join(temp, 'social.svg');
  const ogPath = join(OG_DIR, `${item.slug}.png`);
  await writeFile(svgPath, buildSvg(item), 'utf8');
  run('rsvg-convert', ['--width', String(OG_WIDTH), '--height', String(OG_HEIGHT), '--format', 'png', '--output', ogPath, svgPath]);
  const imageStat = await stat(ogPath);
  if (!imageStat.size) throw new Error(`Generated empty social image for ${item.slug}.`);
  const profile = profileFor(item.title);
  return { slug: item.slug, title: item.title, topic: profile.id, image: `/quick-info/og/${item.slug}.png` };
}

async function main() {
  if (!commandWorks('rsvg-convert', ['--version'])) failOrSkip('librsvg rsvg-convert is required for deterministic social-image rasterization.');
  if (!commandWorks('fc-match', ['Noto Sans Arabic'])) failOrSkip('fontconfig with Noto Sans Arabic is required.');
  const fontCheck = commandResult('fc-match', ['-f', '%{family}', 'Noto Sans Arabic']);
  if (!/Noto Sans Arabic/i.test(fontCheck.stdout || '')) failOrSkip('Noto Sans Arabic was not resolved by fontconfig.');

  const items = await loadPublishedQuickInfo();
  await rm(OG_DIR, { recursive: true, force: true });
  await rm(TMP_ROOT, { recursive: true, force: true });
  await mkdir(OG_DIR, { recursive: true });
  await mkdir(TMP_ROOT, { recursive: true });

  const manifest = [];
  for (const [index, item] of items.entries()) {
    manifest.push(await createSocialImage(item));
    if ((index + 1) % 25 === 0 || index + 1 === items.length) console.log(`[quick-info-social] generated ${index + 1}/${items.length}`);
  }

  await writeFile(MANIFEST_PATH, `${JSON.stringify({ version: 4, generatedAt: new Date().toISOString(), count: manifest.length, items: manifest }, null, 2)}\n`, 'utf8');
  await rm(TMP_ROOT, { recursive: true, force: true });
  console.log(`[quick-info-social] ready: ${manifest.length} topic-aware social images; on-site Quick Info visuals remain browser-rendered HTML/CSS.`);
}

main().catch((error) => { console.error('[quick-info-social]', error); process.exitCode = 1; });
