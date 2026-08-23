import 'server-only';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { Metadata } from 'next';
import dailyToolRoutesJson from '@/generated/daily-tools-routes.json';
import type { LegacyPreservedPage } from '@/lib/legacy-preserved-page';
import { buildSeoMetadata } from '@/lib/seo';

type UnknownRecord = Record<string, unknown>;
type AssetBinding = { fetch(input: Request | string | URL): Promise<Response> };
type AssetEnvironment = { ASSETS?: AssetBinding };
export type DailyToolRelatedLink = { title: string; href: string };
export type DailyToolReference = { title: string; url: string; publisher?: string; year?: string };

export const DAILY_TOOLS_TOTAL = 150;
export const DAILY_TOOLS_HUB_ROUTE = '/daily-tools/';
const ASSET_ROOT = '/daily-tools-data/records';
const EXPECTED_ROUTES = DAILY_TOOLS_TOTAL + 1;

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : null;
}

function cleanText(value: unknown, max = 500000): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function pageFromRecord(value: unknown): LegacyPreservedPage | null {
  const row = asRecord(value);
  if (!row) return null;
  const sourcePath = cleanText(row.source_path, 1000);
  if (!/^daily-tools\/(?:[a-z0-9][a-z0-9-]{0,119}\/)?index\.html$/i.test(sourcePath)) return null;
  const wordCount = Number(row.word_count);
  return {
    source_family: cleanText(row.source_family, 120) || 'daily-tools',
    source_path: sourcePath,
    title: cleanText(row.title, 1000) || null,
    h1: cleanText(row.h1, 1000) || null,
    meta_description: cleanText(row.meta_description, 2000) || null,
    word_count: Number.isFinite(wordCount) && wordCount >= 0 ? Math.round(wordCount) : null,
    body_text: cleanText(row.body_text, 500000) || null,
    body_json: row.body_json ?? {},
    references_json: row.references_json ?? [],
    internal_links_json: row.internal_links_json ?? [],
    images_json: row.images_json ?? [],
  };
}

function sourcePathToRoute(sourcePath: string): string | null {
  if (sourcePath === 'daily-tools/index.html') return DAILY_TOOLS_HUB_ROUTE;
  const match = /^daily-tools\/([a-z0-9][a-z0-9-]{0,119})\/index\.html$/i.exec(sourcePath);
  return match ? `/daily-tools/${match[1].toLowerCase()}/` : null;
}

function normalizeRoute(route: string): string | null {
  const trimmed = route.trim();
  if (trimmed === '/daily-tools' || trimmed === DAILY_TOOLS_HUB_ROUTE) return DAILY_TOOLS_HUB_ROUTE;
  const match = /^\/daily-tools\/([a-z0-9][a-z0-9-]{0,119})\/?$/i.exec(trimmed);
  return match ? `/daily-tools/${match[1].toLowerCase()}/` : null;
}

function assetPathForRoute(route: string): string | null {
  if (route === DAILY_TOOLS_HUB_ROUTE) return `${ASSET_ROOT}/hub.json`;
  const match = /^\/daily-tools\/([a-z0-9][a-z0-9-]{0,119})\/$/i.exec(route);
  return match ? `${ASSET_ROOT}/${match[1].toLowerCase()}.json` : null;
}

async function readCloudflareAsset(pathname: string): Promise<unknown | null> {
  try {
    // OpenNext requires async context access from statically generated routes.
    // The synchronous API can fail inside SSG/ISR execution even though the
    // same binding is valid at runtime.
    const context = await getCloudflareContext({ async: true });
    const assets = (context.env as unknown as AssetEnvironment).ASSETS;
    if (!assets) return null;
    const response = await assets.fetch(`https://assets.local${pathname}`);
    if (!response.ok) return null;
    return await response.json() as unknown;
  } catch {
    return null;
  }
}

async function readLocalAsset(pathname: string): Promise<unknown | null> {
  try {
    const [{ readFile }, path] = await Promise.all([
      import('node:fs/promises'),
      import('node:path'),
    ]);
    const segments = pathname.split('/').filter(Boolean);
    const filename = path.join(process.cwd(), 'public', ...segments);
    return JSON.parse(await readFile(filename, 'utf8')) as unknown;
  } catch {
    return null;
  }
}

const manifestRoutes = [...new Set(
  (dailyToolRoutesJson as unknown[])
    .filter((value): value is string => typeof value === 'string')
    .map(normalizeRoute)
    .filter((value): value is string => Boolean(value)),
)];
const manifestSet = new Set(manifestRoutes);
const toolRoutes = manifestRoutes.filter((route) => route !== DAILY_TOOLS_HUB_ROUTE).sort();
const pageCache = new Map<string, Promise<LegacyPreservedPage | null>>();

async function loadDailyToolPage(route: string): Promise<LegacyPreservedPage | null> {
  const assetPath = assetPathForRoute(route);
  if (!assetPath) return null;
  const raw = await readCloudflareAsset(assetPath) ?? await readLocalAsset(assetPath);
  const page = pageFromRecord(raw);
  if (!page || sourcePathToRoute(page.source_path) !== route) return null;
  return page;
}

export async function getDailyToolPage(route: string): Promise<LegacyPreservedPage | null> {
  const normalized = normalizeRoute(route);
  if (!normalized || !manifestSet.has(normalized)) return null;
  const cached = pageCache.get(normalized);
  if (cached) return cached;
  const pending = loadDailyToolPage(normalized);
  pageCache.set(normalized, pending);
  return pending;
}

export function getDailyToolSlugs(): string[] {
  if (manifestRoutes.length !== EXPECTED_ROUTES || !manifestSet.has(DAILY_TOOLS_HUB_ROUTE)) {
    throw new Error(`Daily Tools manifest integrity failure: expected ${EXPECTED_ROUTES} routes, found ${manifestRoutes.length}.`);
  }
  return toolRoutes.map((route) => route.slice('/daily-tools/'.length, -1));
}

export function getDailyToolRoutes(): string[] {
  if (manifestRoutes.length !== EXPECTED_ROUTES || !manifestSet.has(DAILY_TOOLS_HUB_ROUTE)) {
    throw new Error(`Daily Tools manifest integrity failure: expected ${EXPECTED_ROUTES} routes, found ${manifestRoutes.length}.`);
  }
  return [DAILY_TOOLS_HUB_ROUTE, ...toolRoutes];
}

function normalizeInternalHref(value: unknown): string | null {
  const raw = cleanText(value, 2000);
  if (!raw) return null;
  try {
    const url = new URL(raw, 'https://healthrenewal.org');
    const host = url.hostname.toLowerCase();
    if (host !== 'healthrenewal.org' && host !== 'www.healthrenewal.org') return null;
    const pathname = decodeURIComponent(url.pathname).normalize('NFC');
    if (pathname.includes('\\') || pathname.split('/').some((part) => part === '..' || part === '.')) return null;
    return `${pathname || '/'}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export function getDailyToolRelatedLinks(page: LegacyPreservedPage, currentRoute?: string): DailyToolRelatedLink[] {
  if (!Array.isArray(page.internal_links_json)) return [];
  const seen = new Set<string>();
  const normalizedCurrent = currentRoute?.split(/[?#]/, 1)[0];
  const links: DailyToolRelatedLink[] = [];
  for (const item of page.internal_links_json.slice(0, 250)) {
    const entry = asRecord(item);
    if (!entry) continue;
    const href = normalizeInternalHref(entry.url ?? entry.href);
    const title = cleanText(entry.title ?? entry.label, 500);
    if (!href || !title || seen.has(href) || (normalizedCurrent && href.split(/[?#]/, 1)[0] === normalizedCurrent)) continue;
    seen.add(href);
    links.push({ title, href });
  }
  return links;
}

export function getDailyToolReferences(page: LegacyPreservedPage): DailyToolReference[] {
  if (!Array.isArray(page.references_json)) return [];
  const seen = new Set<string>();
  const references: DailyToolReference[] = [];
  for (const item of page.references_json.slice(0, 100)) {
    const entry = asRecord(item);
    if (!entry) continue;
    const title = cleanText(entry.title ?? entry.label ?? entry.publisher, 600);
    const url = cleanText(entry.url, 2000);
    if (!title || !/^https:\/\//i.test(url) || seen.has(url)) continue;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') continue;
    } catch {
      continue;
    }
    seen.add(url);
    const publisher = cleanText(entry.publisher, 300);
    const year = cleanText(entry.year, 40);
    references.push({ title, url, ...(publisher ? { publisher } : {}), ...(year ? { year } : {}) });
  }
  return references;
}

function cleanTitle(page: LegacyPreservedPage, fallback: string): string {
  return (page.h1 || page.title || fallback)
    .replace(/\s*\|\s*(?:منصة\s+)?روافد\s*$/u, '')
    .trim();
}

export function dailyToolMetadata(page: LegacyPreservedPage | null, route: string): Metadata {
  if (!page) return {};
  const isHub = route === DAILY_TOOLS_HUB_ROUTE;
  const title = cleanTitle(page, isHub ? 'الأدوات اليومية' : 'أداة يومية');
  return buildSeoMetadata({
    title,
    description: page.meta_description || page.body_text?.slice(0, 220) || 'أداة عملية يومية من روافد للاستخدام التثقيفي والتنظيمي غير التشخيصي.',
    path: route,
    index: true,
    follow: true,
    type: 'website',
    keywords: isHub
      ? ['أدوات نفسية تفاعلية', 'أدوات يومية', 'الصحة النفسية', 'التنظيم الذاتي', 'روافد']
      : [title, 'أداة نفسية', 'أداة يومية', 'التنظيم الذاتي', 'روافد'],
    searchIntents: isHub
      ? ['أدوات نفسية يومية', 'تمارين عملية للصحة النفسية', 'أدوات تنظيم ذاتي عربية']
      : [`كيفية استخدام ${title}`, `${title} أداة عملية`, `${title} بالعربي`],
  });
}
