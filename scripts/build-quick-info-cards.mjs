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
  failOrSkip('ImageMagick is required for deterministic static card generation.');
  return '';
}

function findFont(family) {
  const result = commandResult('fc-match', ['-f', '%{file}', family]);
  if (result.error || result.status !== 0 || !result.stdout.trim()) {
    failOrSkip(`A fontconfig font matching ${family} is unavailable.`);
  }
  return result.stdout.trim();
}

function runImage(args) {
  const result = spawnSync(IMAGE_COMMAND, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (result.error || result.status !== 0) {
    throw new Error(`ImageMagick failed: ${result.stderr || result.error?.message || 'unknown error'}`);
  }
}

function escapePango(value) {
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
  if (!response.ok) {
    throw new Error(`Quick Info build query failed (${response.status}): ${await response.text()}`);
  }
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

function renderPangoLayer({ text, width, height, pointSize, font, color, output }) {
  runImage([
    '-background', 'none',
    '-fill', color,
    '-font', font,
    '-pointsize', String(pointSize),
    '-gravity', 'east',
    '-size', `${width}x${height}`,
    `pango:<span foreground="${color}">${escapePango(text)}</span>`,
    output,
  ]);
}

async function createCard(item, fonts) {
  const temp = join(TMP_ROOT, item.slug);
  await mkdir(temp, { recursive: true });
  const base = join(temp, 'base.png');
  const title = join(temp, 'title.png');
  const brand = join(temp, 'brand.png');
  const subtitle = join(temp, 'subtitle.png');
  const context = join(temp, 'context.png');
  const site = join(temp, 'site.png');
  const og = join(OG_DIR, `${item.slug}.png`);
  const card = join(CARD_DIR, `${item.slug}.webp`);

  runImage([
    '-size', `${CARD_WIDTH}x${CARD_HEIGHT}`,
    'xc:#f4faf8',
    '-fill', '#e3f1ef', '-draw', 'circle 1110,60 1270,60',
    '-fill', '#f3f2e8', '-draw', 'circle 120,590 280,590',
    '-fill', '#ffffff', '-stroke', '#d8e8e5', '-strokewidth', '1',
    '-draw', 'roundrectangle 64,54 1136,576 34,34',
    base,
  ]);

  const titleSize = item.title.length > 67 ? 42 : item.title.length > 56 ? 45 : 49;
  renderPangoLayer({ text: item.title, width: 984, height: 235, pointSize: titleSize, font: fonts.arabicBold, color: '#102f36', output: title });
  renderPangoLayer({ text: 'روافد', width: 260, height: 64, pointSize: 37, font: fonts.arabicBold, color: '#123b3c', output: brand });
  renderPangoLayer({ text: 'منصة المعرفة العربية الموثوقة', width: 360, height: 45, pointSize: 18, font: fonts.arabicRegular, color: '#36545a', output: subtitle });
  renderPangoLayer({ text: 'معلومة سريعة · قراءة عربية واضحة · منصة روافد', width: 760, height: 54, pointSize: 22, font: fonts.arabicRegular, color: '#31595b', output: context });

  runImage([
    '-background', 'none', '-fill', '#4f7172', '-font', fonts.latinRegular,
    '-pointsize', '19', '-gravity', 'east', '-size', '300x42', 'label:healthrenewal.org', site,
  ]);

  runImage([
    base,
    title, '-gravity', 'northeast', '-geometry', '+108+222', '-composite',
    brand, '-gravity', 'northeast', '-geometry', '+108+72', '-composite',
    subtitle, '-gravity', 'northeast', '-geometry', '+108+128', '-composite',
    context, '-gravity', 'southeast', '-geometry', '+108+91', '-composite',
    site, '-gravity', 'southeast', '-geometry', '+108+48', '-composite',
    '-strip', '-quality', '92', og,
  ]);

  runImage([
    og,
    '-resize', `${LIST_WIDTH}x${LIST_HEIGHT}!`,
    '-strip', '-quality', '82',
    card,
  ]);

  const [ogStat, cardStat] = await Promise.all([stat(og), stat(card)]);
  if (!ogStat.size || !cardStat.size) throw new Error(`Generated empty card asset for ${item.slug}.`);
  return { slug: item.slug, title: item.title, og: `/quick-info/og/${item.slug}.png`, card: `/quick-info/cards/${item.slug}.webp` };
}

async function main() {
  IMAGE_COMMAND = selectImageMagickCommand();
  if (!commandWorks('fc-match', ['Noto Sans Arabic'])) failOrSkip('fontconfig is required for deterministic Arabic rendering.');
  const fonts = {
    arabicRegular: findFont('Noto Sans Arabic'),
    arabicBold: findFont('Noto Sans Arabic:style=Bold'),
    latinRegular: findFont('Noto Sans'),
  };
  const items = await loadPublishedQuickInfo();

  await rm(CARD_DIR, { recursive: true, force: true });
  await rm(OG_DIR, { recursive: true, force: true });
  await rm(TMP_ROOT, { recursive: true, force: true });
  await mkdir(CARD_DIR, { recursive: true });
  await mkdir(OG_DIR, { recursive: true });
  await mkdir(TMP_ROOT, { recursive: true });

  const manifest = [];
  for (const [index, item] of items.entries()) {
    manifest.push(await createCard(item, fonts));
    if ((index + 1) % 25 === 0 || index + 1 === items.length) {
      console.log(`[quick-info-cards] generated ${index + 1}/${items.length}`);
    }
  }

  await writeFile(MANIFEST_PATH, `${JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), count: manifest.length, items: manifest }, null, 2)}\n`, 'utf8');
  await rm(TMP_ROOT, { recursive: true, force: true });
  console.log(`[quick-info-cards] ready: ${manifest.length} static RTL cards; one Supabase REST read, zero runtime image API calls.`);
}

main().catch((error) => {
  console.error('[quick-info-cards]', error);
  process.exitCode = 1;
});
