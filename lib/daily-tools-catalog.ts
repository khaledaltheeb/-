import type { Metadata } from 'next';
import dailyToolsPayload from '@/data/legacy-production-batches/daily-tools/001.json';
import type { LegacyPreservedPage } from '@/lib/legacy-preserved-page';
import { buildSeoMetadata } from '@/lib/seo';

type UnknownRecord = Record<string, unknown>;
type DailyToolsPayload = { records?: unknown[] };

export const DAILY_TOOLS_TOTAL = 150;
export const DAILY_TOOLS_HUB_ROUTE = '/daily-tools/';

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
  return match ? `/daily-tools/${match[1]}/` : null;
}

const payload = dailyToolsPayload as unknown as DailyToolsPayload;
const routeMap = new Map<string, LegacyPreservedPage>();
for (const raw of Array.isArray(payload.records) ? payload.records : []) {
  const page = pageFromRecord(raw);
  if (!page) continue;
  const route = sourcePathToRoute(page.source_path);
  if (!route || routeMap.has(route)) continue;
  routeMap.set(route, page);
}

const toolRoutes = [...routeMap.keys()].filter((route) => route !== DAILY_TOOLS_HUB_ROUTE).sort();
if (!routeMap.has(DAILY_TOOLS_HUB_ROUTE) || toolRoutes.length !== DAILY_TOOLS_TOTAL) {
  throw new Error(`Daily Tools catalog integrity failure: expected hub + ${DAILY_TOOLS_TOTAL} tools, found ${routeMap.size} records.`);
}

export function getDailyToolPage(route: string): LegacyPreservedPage | null {
  const normalized = route.endsWith('/') ? route : `${route}/`;
  return routeMap.get(normalized) ?? null;
}

export function getDailyToolSlugs(): string[] {
  return toolRoutes.map((route) => route.slice('/daily-tools/'.length, -1));
}

export function getDailyToolRoutes(): string[] {
  return [DAILY_TOOLS_HUB_ROUTE, ...toolRoutes];
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
