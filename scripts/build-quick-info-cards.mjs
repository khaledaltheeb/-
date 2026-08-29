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

const TOPIC_PROFILES = [
  {
    id: 'mental-health',
    label: 'الصحة النفسية',
    match: /اكتئاب|قلق|حزن|مزاج|نفسي|نفسية|توتر|هلع|وسواس|صدمة|احتراق|وحدة|خوف|غضب|مشاعر|ثقة بالنفس/u,
    accent: '#176b65',
    accentDark: '#0f4f4b',
    soft: '#dff2ee',
    glow: '#edf8f5',
  },
  {
    id: 'sleep',
    label: 'النوم والراحة',
    match: /نوم|أرق|استيقاظ|كوابيس|نعاس|ساعة بيولوجية|راحة/u,
    accent: '#405d78',
    accentDark: '#2f485f',
    soft: '#e6edf3',
    glow: '#f1f5f8',
  },
  {
    id: 'family',
    label: 'الأسرة والعلاقات',
    match: /أسرة|اسرة|زواج|زوج|زوجة|علاقة|علاقات|والد|والدة|أبناء|ابناء|طفل|أطفال|اطفال|مراهق|تربية/u,
    accent: '#8a6651',
    accentDark: '#684b3c',
    soft: '#f1e8e1',
    glow: '#faf6f2',
  },
  {
    id: 'addiction',
    label: 'التعافي والإدمان',
    match: /إدمان|ادمان|تعاطي|انسحاب|انتكاس|مخدر|كحول|تدخين|نيكوتين|تعافي/u,
    accent: '#5f6752',
    accentDark: '#454b3d',
    soft: '#e9ede3',
    glow: '#f5f7f2',
  },
  {
    id: 'nutrition',
    label: 'التغذية ونمط الحياة',
    match: /غذاء|تغذية|طعام|أكل|اكل|سكر|قهوة|كافيين|ماء|وزن|شهية|فيتامين|رياضة|مشي/u,
    accent: '#6b7a45',
    accentDark: '#4f5b32',
    soft: '#edf1df',
    glow: '#f7f9f1',
  },
  {
    id: 'neurology',
    label: 'الدماغ والجهاز العصبي',
    match: /صرع|نوبة|نوبات|صداع|شقيقة|ذاكرة|تركيز|دوار|دوخة|دماغ|عصبي|أعصاب|اعصاب/u,
    accent: '#516a80',
    accentDark: '#3c5062',
    soft: '#e5edf2',
    glow: '#f2f6f8',
  },
  {
    id: 'medication',
    label: 'دواء وسلامة صحية',
    match: /دواء|أدوية|ادوية|جرعة|مسكن|مضاد|علاج|آثار جانبية|اعراض جانبية|أعراض جانبية/u,
    accent: '#3f7172',
    accentDark: '#2d5556',
    soft: '#e0eff0',
    glow: '#f1f7f7',
  },
  {
    id: 'social',
    label: 'الحياة الاجتماعية',
    match: /صديق|أصدقاء|اصدقاء|اجتماعي|اجتماعية|عمل|مدرسة|جامعة|تنمر|حدود|تواصل|رفض|مقارنة/u,
    accent: '#6e6282',
    accentDark: '#514860',
    soft: '#ece8f2',
    glow: '#f6f3f9',
  },
];

const DEFAULT_TOPIC = {
  id: 'general',
  label: 'معلومة سريعة',
  accent: '#176b65',
  accentDark: '#123b3c',
  soft: '#e3f1ef',
  glow: '#f4faf8',
};

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

function topicProfile(title) {
  const normalized = String(title || '').trim();
  return TOPIC_PROFILES.find((profile) => profile.match.test(normalized)) || DEFAULT_TOPIC;
}

function wrapArabicTitle(title, maxChars = 27, maxLines = 3) {
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

function buildBrandIcon(theme) {
  return `
    <rect x="1008" y="82" width="72" height="72" rx="20" fill="${theme.accentDark}"/>
    <path d="M1029 126c9-10 20-15 33-15v23c-13 0-24 5-33 15z" fill="#ffffff" opacity="0.96"/>
    <path d="M1059 102c-8 5-13 12-15 21 10-2 18-7 23-15-1-4-4-6-8-6z" fill="#ffffff" opacity="0.82"/>
    <circle cx="1027" cy="105" r="5" fill="#ffffff" opacity="0.78"/>
  `;
}

function buildSvg(title) {
  const theme = topicProfile(title);
  const titleLines = wrapArabicTitle(title);
  const titleSize = title.length > 74 ? 42 : title.length > 62 ? 46 : title.length > 50 ? 50 : 54;
  const titleStartY = titleLines.length === 1 ? 340 : titleLines.length === 2 ? 310 : 274;
  const lineHeight = 72;
  const titleTspans = titleLines.map((line, index) => (
    `<tspan x="1092" y="${titleStartY + index * lineHeight}">${escapeXml(line)}</tspan>`
  )).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" xml:lang="ar">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${theme.glow}"/>
      <stop offset="1" stop-color="#f8f6ed"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#123b3c" flood-opacity="0.08"/>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1115" cy="68" r="178" fill="${theme.soft}" opacity="0.94"/>
  <circle cx="86" cy="582" r="184" fill="#f1eee3" opacity="0.82"/>
  <circle cx="160" cy="78" r="76" fill="${theme.soft}" opacity="0.36"/>
  <rect x="54" y="44" width="1092" height="542" rx="38" fill="#ffffff" stroke="#d8e8e5" stroke-width="1" filter="url(#shadow)"/>

  ${buildBrandIcon(theme)}

  <g font-family="Noto Sans Arabic, Noto Sans, sans-serif" direction="rtl" unicode-bidi="plaintext" text-anchor="end">
    <text x="990" y="116" font-size="37" font-weight="700" fill="#123b3c">روافد</text>
    <text x="990" y="151" font-size="19" font-weight="500" fill="#36545a">منصة المعرفة العربية الموثوقة</text>

    <rect x="820" y="188" width="272" height="48" rx="24" fill="${theme.soft}"/>
    <text x="1062" y="221" font-size="19" font-weight="700" fill="${theme.accentDark}">${escapeXml(theme.label)}</text>

    <text font-size="${titleSize}" font-weight="750" fill="#102f36">${titleTspans}</text>

    <line x1="674" y1="472" x2="1092" y2="472" stroke="${theme.accent}" stroke-width="4" stroke-linecap="round" opacity="0.72"/>
    <text x="1092" y="518" font-size="23" font-weight="500" fill="#31595b">معلومة سريعة • قراءة عربية واضحة • منصة روافد</text>
  </g>

  <text x="1092" y="558" font-family="Noto Sans, sans-serif" font-size="19" font-weight="600" fill="#4f7172" text-anchor="end">healthrenewal.org</text>
</svg>`;
}

async function createCard(item) {
  const temp = join(TMP_ROOT, item.slug);
  const theme = topicProfile(item.title);
  await mkdir(temp, { recursive: true });
  const svgPath = join(temp, 'card.svg');
  const og = join(OG_DIR, `${item.slug}.png`);
  const card = join(CARD_DIR, `${item.slug}.webp`);
  await writeFile(svgPath, buildSvg(item.title), 'utf8');

  run('rsvg-convert', ['--width', String(CARD_WIDTH), '--height', String(CARD_HEIGHT), '--format', 'png', '--output', og, svgPath]);
  run(IMAGE_COMMAND, [og, '-resize', `${LIST_WIDTH}x${LIST_HEIGHT}!`, '-strip', '-quality', '82', card]);

  const [ogStat, cardStat] = await Promise.all([stat(og), stat(card)]);
  if (!ogStat.size || !cardStat.size) throw new Error(`Generated empty card asset for ${item.slug}.`);
  return {
    slug: item.slug,
    title: item.title,
    topic: theme.id,
    topicLabel: theme.label,
    og: `/quick-info/og/${item.slug}.png`,
    card: `/quick-info/cards/${item.slug}.webp`,
  };
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

  await writeFile(MANIFEST_PATH, `${JSON.stringify({ version: 3, generatedAt: new Date().toISOString(), count: manifest.length, items: manifest }, null, 2)}\n`, 'utf8');
  await rm(TMP_ROOT, { recursive: true, force: true });
  console.log(`[quick-info-cards] ready: ${manifest.length} topic-aware static RTL cards; one Supabase REST read, zero runtime image API calls.`);
}

main().catch((error) => {
  console.error('[quick-info-cards]', error);
  process.exitCode = 1;
});
