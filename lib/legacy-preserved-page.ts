import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata } from '@/lib/seo';

type UnknownRecord = Record<string, unknown>;

export type PublishedCanonicalContent = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_text: string | null;
  body_json: unknown;
  content_type: string;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  published_at: string | null;
  updated_at: string | null;
  reviewer_display_name: string | null;
  last_reviewed_at: string | null;
  references_json: unknown;
  medical_disclaimer: string | null;
};

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
  current_content: PublishedCanonicalContent | null;
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

function currentTakeoverAllowed(route: string) {
  return !route.startsWith('/assessments/') && !route.startsWith('/cognitive-tests/');
}

function canonicalVariants(route: string) {
  const values = new Set<string>([route]);
  if (route !== '/') {
    if (route.endsWith('/')) values.add(route.slice(0, -1));
    else values.add(`${route}/`);
  }
  return [...values];
}

function normalizeCurrentContent(value: unknown): PublishedCanonicalContent | null {
  const row = asRecord(value);
  if (!row || row.robots_index !== true) return null;
  const id = cleanText(row.id, 200);
  const slug = cleanText(row.slug, 500);
  const title = cleanText(row.title, 2000);
  if (!id || !slug || !title) return null;
  return {
    id,
    slug,
    title,
    excerpt: cleanText(row.excerpt, 4000) || null,
    body_text: cleanText(row.body_text, 500000) || null,
    body_json: row.body_json ?? {},
    content_type: cleanText(row.content_type, 120) || 'article',
    seo_title: cleanText(row.seo_title, 2000) || null,
    seo_description: cleanText(row.seo_description, 4000) || null,
    canonical_url: cleanText(row.canonical_url, 1000) || null,
    robots_index: true,
    robots_follow: row.robots_follow !== false,
    published_at: cleanText(row.published_at, 100) || null,
    updated_at: cleanText(row.updated_at, 100) || null,
    reviewer_display_name: cleanText(row.reviewer_display_name, 500) || null,
    last_reviewed_at: cleanText(row.last_reviewed_at, 100) || null,
    references_json: row.references_json ?? [],
    medical_disclaimer: cleanText(row.medical_disclaimer, 8000) || null,
  };
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

function normalizePage(value: unknown, route: string, currentContent: PublishedCanonicalContent | null): LegacyPreservedPage | null {
  const row = asRecord(value);
  if (!row && !currentContent) return null;
  if (!row && currentContent) {
    const bodyText = currentContent.body_text;
    return {
      source_family: 'reviewed-current-content',
      source_path: currentContent.canonical_url || route,
      title: currentContent.title,
      h1: currentContent.title,
      meta_description: currentContent.seo_description || currentContent.excerpt,
      word_count: bodyText ? bodyText.split(/\s+/u).filter(Boolean).length : null,
      body_text: bodyText,
      body_json: currentContent.body_json,
      references_json: currentContent.references_json,
      internal_links_json: [],
      images_json: [],
      current_content: currentContent,
    };
  }
  const sourcePath = cleanText(row?.source_path, 1000);
  if (!sourcePath || sourcePath.includes('..')) return null;
  const wordCount = Number(row?.word_count);
  return {
    source_family: cleanText(row?.source_family, 120) || null,
    source_path: sourcePath,
    title: cleanText(row?.title, 1000) || null,
    h1: cleanText(row?.h1, 1000) || null,
    meta_description: cleanText(row?.meta_description, 2000) || null,
    word_count: Number.isFinite(wordCount) && wordCount >= 0 ? Math.round(wordCount) : null,
    body_text: cleanText(row?.body_text, 500000) || null,
    body_json: row?.body_json ?? {},
    references_json: row?.references_json ?? [],
    internal_links_json: row?.internal_links_json ?? [],
    images_json: row?.images_json ?? [],
    current_content: currentContent,
  };
}

async function getPublishedCanonicalContent(route: string): Promise<PublishedCanonicalContent | null> {
  if (!currentTakeoverAllowed(route)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content')
    .select('id,slug,title,excerpt,body_text,body_json,content_type,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,reviewer_display_name,last_reviewed_at,references_json,medical_disclaimer')
    .in('canonical_url', canonicalVariants(route))
    .eq('status', 'published')
    .eq('robots_index', true)
    .lte('published_at', new Date().toISOString())
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return normalizeCurrentContent(data);
}

export async function getLegacyPreservedPage(route: string): Promise<LegacyPreservedPage | null> {
  const normalizedRoute = safeRoute(route);
  if (!normalizedRoute) return null;
  const supabase = await createClient();
  const [legacyResult, currentContent] = await Promise.all([
    supabase.rpc('get_legacy_preserved_page', { p_route: normalizedRoute }),
    getPublishedCanonicalContent(normalizedRoute),
  ]);
  if (legacyResult.error) {
    console.error('legacy preservation read failed', { route: normalizedRoute, code: legacyResult.error.code });
  }
  return normalizePage(legacyResult.data, normalizedRoute, currentContent);
}

export function legacyPreservedMetadata(page: LegacyPreservedPage | null, route: string): Metadata {
  if (!page) return {};
  const current = page.current_content;
  if (current) {
    return buildSeoMetadata({
      title: current.seo_title || current.title,
      description: current.seo_description || current.excerpt,
      path: current.canonical_url || legacyCanonicalPath(route),
      index: current.robots_index,
      follow: current.robots_follow,
      type: ['article', 'guide', 'research', 'news', 'condition', 'protocol', 'intervention', 'assessment'].includes(current.content_type) ? 'article' : 'website',
      publishedTime: current.published_at,
      modifiedTime: current.updated_at,
    });
  }
  return buildSeoMetadata({
    title: page.title || page.h1 || 'محتوى محفوظ',
    description: page.meta_description || page.body_text?.slice(0, 220) || 'صفحة محفوظة من مكتبة روافد قيد المراجعة والترقية التحريرية.',
    path: legacyCanonicalPath(route),
    index: false,
    follow: true,
    type: 'website',
  });
}
