import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata } from '@/lib/seo';

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
    const title = cleanText(entry.title ?? entry.label, 500);
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
    const title = cleanText(entry.title ?? entry.label ?? entry.publisher, 600);
    const url = cleanText(entry.url, 2000);
    if (!title || !/^https:\/\//i.test(url) || seen.has(url)) continue;
    seen.add(url);
    const publisher = cleanText(entry.publisher, 300);
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
  return buildSeoMetadata({
    title: page.title || page.h1 || 'محتوى محفوظ',
    description: page.meta_description || page.body_text?.slice(0, 220) || 'صفحة محفوظة من مكتبة روافد قيد المراجعة والترقية التحريرية.',
    path: legacyCanonicalPath(route),
    index: false,
    follow: true,
    type: 'website',
  });
}
