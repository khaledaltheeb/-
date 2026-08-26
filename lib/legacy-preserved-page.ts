import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata } from '@/lib/seo';
import { shouldIndexPreservedPublishedPage } from '@/lib/public-indexability';

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

type PreservedLinkReplacement = { href: string; title?: string };

const STALE_PRESERVED_LINK_REPLACEMENTS = new Map<string, PreservedLinkReplacement>([
  ['/autism/', { href: '/family-guide/conditions/autism/', title: 'دليل الأسرة العملي لاضطراب طيف التوحد' }],
  ['/care-guides/caregiver-wellbeing/', { href: '/evidence-guides/caregiver-wellbeing/', title: 'رفاه مقدم الرعاية ودعم الأسرة' }],
  ['/comparisons/borderline-vs-bipolar/', { href: '/encyclopedia/concept-1885/', title: 'التشخيص التفريقي لاضطراب الشخصية الحدية' }],
  ['/content/adhd/', { href: '/family-guide/conditions/adhd/', title: 'دليل الأسرة لاضطراب فرط الحركة وتشتت الانتباه' }],
  ['/content/anxiety/', { href: '/evidence-guides/clinical-anxiety/', title: 'اضطرابات القلق: الفهم والتقييم والعلاج الآمن' }],
  ['/content/ocd/', { href: '/encyclopedia/concept-0045/', title: 'الوسواس القهري: الفروق والتقييم' }],
  ['/content/stress/', { href: '/encyclopedia/concept-0161/', title: 'الضغط النفسي: ما هو ومتى يصبح عبئًا؟' }],
  ['/mental-health/stress/', { href: '/encyclopedia/concept-0161/', title: 'الضغط النفسي: ما هو ومتى يصبح عبئًا؟' }],
  ['/special-ed-encyclopedia/learning-disabilities/', { href: '/care-guides/specific-learning-disorder-home-school/', title: 'دليل صعوبات التعلم بين المنزل والمدرسة' }],
]);

// These routes were emitted only by legacy navigation metadata and were verified by the
// full sitemap crawler to return 404 with no published or preserved route behind them.
// Suppressing them prevents publishing broken internal navigation without deleting or
// mutating any article body, scientific content, or valid historical URL.
const CONFIRMED_DEAD_PRESERVED_LINKS = new Set<string>([
  '/care-guides/communication-disorders-differential/',
  '/care-guides/family-crisis-plan/',
  '/care-guides/ocd-assessment/',
  '/care-guides/older-adult-digital-safety/',
  '/care-guides/safe-response-behavior-escalation/',
  '/care-guides/safety-plan/',
  '/comparisons/attachment-styles/',
  '/comparisons/body-image-vs-body-dysmorphia/',
  '/comparisons/grief-vs-depression/',
  '/comparisons/high-gaming-vs-gaming-disorder/',
  '/comparisons/ocd-vs-anxiety/',
  '/comparisons/psychosis-vs-dissociation/',
  '/comparisons/secure-vs-anxious-attachment/',
  '/comparisons/social-anxiety-vs-shyness/',
  '/content/adolescent-identity/',
  '/content/anger-management/',
  '/content/attachment-styles/',
  '/content/autism-spectrum-disorder/',
  '/content/binge-eating-disorder/',
  '/content/body-dysmorphic-disorder/',
  '/content/body-image/',
  '/content/borderline-personality-disorder/',
  '/content/breakup-recovery/',
  '/content/bulimia-nervosa/',
  '/content/caregiver-support/',
  '/content/cbt/',
  '/content/child-anxiety/',
  '/content/cognitive-rehabilitation/',
  '/content/decision-fatigue/',
  '/content/dialectical-behavior-therapy/',
  '/content/emotion-regulation/',
  '/content/family-school-collaboration-meeting/',
  '/content/fear/',
  '/content/grief/',
  '/content/identity/',
  '/content/insomnia/',
  '/content/internet-addiction/',
  '/content/panic-disorder/',
  '/content/personality/',
  '/content/positive-parenting/',
  '/content/procrastination/',
  '/content/psychological-boundaries/',
  '/content/psychological-safety/',
  '/content/psychotherapy/',
  '/content/ptsd/',
  '/content/quality-of-life/',
  '/content/relationship-boundaries/',
  '/content/schizophrenia/',
  '/content/shared-decision-making/',
  '/content/sleep-deprivation/',
  '/content/sleep-habits/',
  '/content/sleep-problems/',
  '/content/social-anxiety/',
  '/content/social-anxiety-child/',
  '/content/social-anxiety-disorder/',
  '/content/social-comparison/',
  '/content/social-psychology/',
  '/content/social-support/',
  '/content/stress-management/',
  '/content/substance-use-disorders/',
  '/content/teen-depression/',
  '/content/tic-disorders/',
  '/content/tourette-syndrome/',
  '/content/treatment-outcome-monitoring/',
  '/content/workplace-mental-health/',
  '/content/workplace-stress/',
  '/encyclopedia/panic-disorder-coping-strategies/',
  '/evidence-guides/trauma-safe-guide/',
  '/health/brain-health/',
  '/library/branches/branches-clinical-psychology/',
  '/library/therapies/erp/',
  '/mental-health-at-work/',
  '/mental-health/anger-management/',
  '/mental-health/cognitive-aging/',
  '/mental-health/mental-health-at-work/',
  '/mental-health/ptsd/',
  '/mental-health/sleep/',
  '/quick-info/five-reasons-hard-to-say-no/',
  '/quick-info/reassurance-seeking-vs-support/',
  '/special-needs/aac-readiness-and-assessment/',
  '/special-needs/aac-selecting-aac-system-device/',
  '/special-needs/autism/sensory-profile-overload/',
  '/special-needs/fba/',
  '/special-needs/guides/inclusive-schooling/',
  '/special-needs/motor-mobility/',
  '/special-needs/practical/communication-language-aac/',
  '/special-needs/school-accommodations/',
  '/special-needs/self-advocacy-consent/',
  '/special-needs/udl/',
]);

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

function repairPreservedInternalLink(href: string, title: string): LegacyPreservedLink | null {
  const url = new URL(href, 'https://healthrenewal.org');
  const route = safeRoute(url.pathname);
  if (!route) return { title, href };
  const replacement = STALE_PRESERVED_LINK_REPLACEMENTS.get(route);
  if (replacement) return { title: replacement.title || title, href: replacement.href };
  if (CONFIRMED_DEAD_PRESERVED_LINKS.has(route)) return null;
  return { title, href };
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
    if (!href || !title) continue;
    const repaired = repairPreservedInternalLink(href, title);
    if (!repaired || seen.has(repaired.href)) continue;
    seen.add(repaired.href);
    links.push(repaired);
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
  const canonicalPath = legacyCanonicalPath(route);
  return buildSeoMetadata({
    title: page.title || page.h1 || 'محتوى محفوظ',
    description: page.meta_description || page.body_text?.slice(0, 220) || 'صفحة محفوظة من مكتبة روافد قيد المراجعة والترقية التحريرية.',
    path: canonicalPath,
    index: shouldIndexPreservedPublishedPage({ sourceFamily: page.source_family, route: canonicalPath }),
    follow: true,
    type: 'website',
  });
}
