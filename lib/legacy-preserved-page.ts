import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { BRAND_NAME, buildSeoMetadata } from '@/lib/seo';

type UnknownRecord = Record<string, unknown>;

export type LegacyPreservedPage = {
  source_family: string | null;
  source_path: string;
  title: string | null;
  h1: string | null;
  meta_description: string | null;
  word_count: number | null;
  body_text: string | null;
  body_json: unknown;
  references_json: unknown;
  internal_links_json: unknown;
  images_json: unknown;
};

export type LegacyPreservedLink = { title: string; href: string };
export type LegacyPreservedReference = { title: string; url: string; publisher?: string; year?: string };

function asRecord(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : null;
}

function cleanText(value: unknown, max = 20000): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

const LEGACY_BRAND_REPLACEMENTS: ReadonlyArray<readonly [string, string]> = [
  ['منصة الصحة النفسية', BRAND_NAME],
  ['منصة علم النفس والصحة النفسية', BRAND_NAME],
  ['Mental Health Knowledge Platform', BRAND_NAME],
];

const REVIEW_GATED_PRESERVED_PREFIXES = ['/care-guides/', '/evidence-guides/'] as const;

export function normalizeLegacyBrandText(value: unknown, max = 20000): string {
  let normalized = cleanText(value, max);
  for (const [legacy, current] of LEGACY_BRAND_REPLACEMENTS) {
    normalized = normalized.split(legacy).join(current);
  }
  return normalized.replace(/\s+/g, ' ').trim();
}

export function legacyDisplayTitle(page: LegacyPreservedPage): string {
  return normalizeLegacyBrandText(page.h1 || page.title || 'محتوى من مكتبة منصة روافد', 1000);
}

function decodedRoute(value: string) {
  try { return decodeURIComponent(value).normalize('NFC'); } catch { return value.normalize('NFC'); }
}

function safeRoute(route: string): string | null {
  const trimmed = decodedRoute(route.trim());
  if (!trimmed || trimmed.length > 500 || trimmed.includes('\\') || trimmed.includes('?') || trimmed.includes('#')) return null;
  const parts = trimmed.split('/').filter(Boolean);
  if (parts.some((part) => part === '..' || part === '.')) return null;
  return `/${parts.join('/')}${trimmed.endsWith('/') ? '/' : trimmed.toLowerCase().endsWith('.html') ? '' : '/'}`;
}

export function legacyCanonicalPath(route: string): string {
  return safeRoute(route) ?? '/';
}

export function legacyPreservedCanIndex(route: string): boolean {
  const canonical = legacyCanonicalPath(route);
  return !REVIEW_GATED_PRESERVED_PREFIXES.some((prefix) => canonical.startsWith(prefix));
}

export function normalizeLegacyInternalHref(value: unknown): string | null {
  const raw = cleanText(value, 2000);
  if (!raw) return null;
  try {
    const url = new URL(raw, 'https://healthrenewal.org');
    const host = url.hostname.toLowerCase();
    if (host !== 'healthrenewal.org' && host !== 'www.healthrenewal.org') return null;
    return `${decodedRoute(url.pathname)}${url.search}${url.hash}` || '/';
  } catch {
    return null;
  }
}

export function legacyInternalLinks(value: unknown): LegacyPreservedLink[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const links: LegacyPreservedLink[] = [];
  for (const item of value.slice(0, 250)) {
    const entry = asRecord(item);
    if (!entry) continue;
    const href = normalizeLegacyInternalHref(entry.url ?? entry.href);
    const title = normalizeLegacyBrandText(entry.title ?? entry.label, 500);
    if (!href || !title || seen.has(href)) continue;
    seen.add(href);
    links.push({ title, href });
  }
  return links;
}

export function legacyReferences(value: unknown): LegacyPreservedReference[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const references: LegacyPreservedReference[] = [];
  for (const item of value.slice(0, 100)) {
    const entry = asRecord(item);
    if (!entry) continue;
    const title = normalizeLegacyBrandText(entry.title ?? entry.label ?? entry.publisher, 600);
    const url = cleanText(entry.url, 2000);
    if (!title || !/^https:\/\//i.test(url) || seen.has(url)) continue;
    seen.add(url);
    const publisher = normalizeLegacyBrandText(entry.publisher, 300);
    const year = cleanText(entry.year, 40);
    references.push({ title, url, ...(publisher ? { publisher } : {}), ...(year ? { year } : {}) });
  }
  return references;
}

function normalizePage(value: unknown): LegacyPreservedPage | null {
  const row = asRecord(value);
  if (!row) return null;
  const sourcePath = cleanText(row.source_path, 1000);
  if (!sourcePath || sourcePath.includes('..')) return null;
  const wordCount = Number(row.word_count);
  return {
    source_family: cleanText(row.source_family, 120) || null,
    source_path: sourcePath,
    title: normalizeLegacyBrandText(row.title, 1000) || null,
    h1: normalizeLegacyBrandText(row.h1, 1000) || null,
    meta_description: normalizeLegacyBrandText(row.meta_description, 2000) || null,
    word_count: Number.isFinite(wordCount) && wordCount >= 0 ? Math.round(wordCount) : null,
    body_text: cleanText(row.body_text, 500000) || null,
    body_json: row.body_json ?? {},
    references_json: row.references_json ?? [],
    internal_links_json: row.internal_links_json ?? [],
    images_json: row.images_json ?? [],
  };
}

export async function getLegacyPreservedPage(route: string): Promise<LegacyPreservedPage | null> {
  const normalizedRoute = safeRoute(route);
  if (!normalizedRoute) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_legacy_preserved_page', { p_route: normalizedRoute });
  if (error) {
    console.error('legacy preservation read failed', { route: normalizedRoute, code: error.code });
    return null;
  }
  return normalizePage(data);
}

export function legacyPreservedMetadata(page: LegacyPreservedPage | null, route: string): Metadata {
  if (!page) return {};
  const title = legacyDisplayTitle(page);
  const description = normalizeLegacyBrandText(
    page.meta_description || page.body_text?.slice(0, 220) || 'صفحة منشورة من مكتبة منصة روافد، محفوظة على مسارها الأصلي وتخضع للترقية التحريرية المستمرة.',
    2000,
  );
  return buildSeoMetadata({
    title,
    description,
    path: legacyCanonicalPath(route),
    index: legacyPreservedCanIndex(route),
    follow: true,
    type: 'website',
  });
}
