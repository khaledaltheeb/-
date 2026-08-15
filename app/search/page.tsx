import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { searchCognitivePages } from '@/lib/cognitive-program';
import { getQuickInfoItems, quickInfoContentSlug } from '@/lib/quick-info';
import { PSYCH_ENCYCLOPEDIA_RELEASE_RECORDS } from '@/lib/psych-encyclopedia-release';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'البحث في منصة روافد',
  description: 'البحث الموحد في محتوى منصة روافد والقطاعات والأقسام والمختصين والمراكز والموسوعات المعرفية والنفسية.',
  alternates: { canonical: '/search' },
  robots: { index: false, follow: true, noarchive: true },
};

type SP = Promise<{ q?: string; type?: string }>;
type T = 'content' | 'condition' | 'sector' | 'category' | 'specialist' | 'center' | 'community';
type R = {
  entity_type: T;
  entity_id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  destination: string;
  score: number;
};

const labels: Record<T, string> = {
  content: 'المحتوى',
  condition: 'الموسوعة النفسية',
  sector: 'القطاعات',
  category: 'الأقسام',
  specialist: 'المختصون',
  center: 'المراكز',
  community: 'المتدربون والمتطوعون',
};
const allowed = new Set(Object.keys(labels));
const psychReleaseSlugs = new Set(PSYCH_ENCYCLOPEDIA_RELEASE_RECORDS.map((record) => record.slug));

function normalizeSearch(value: string) {
  return value
    .toLocaleLowerCase('ar')
    .replace(/[ًٌٍَُِّْـٰ]/gu, '')
    .replace(/[أإآٱ]/gu, 'ا')
    .replace(/ى/gu, 'ي')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/gu, ' ');
}

function searchPsychEncyclopedia(query: string, limit = 75): R[] {
  const normalizedQuery = normalizeSearch(query);
  const queryTokens = normalizedQuery.split(' ').filter(Boolean);
  if (!normalizedQuery || queryTokens.length === 0) return [];

  return PSYCH_ENCYCLOPEDIA_RELEASE_RECORDS.flatMap((record): R[] => {
    const title = normalizeSearch(record.title);
    const primary = normalizeSearch(record.primary_keyword ?? '');
    const secondary = record.secondary_keywords.map(normalizeSearch);
    const aliases = record.search_aliases.map(normalizeSearch);
    const semantic = record.semantic_terms.map(normalizeSearch);
    const excerpt = normalizeSearch(record.excerpt ?? '');
    const body = normalizeSearch(record.body_text ?? '');
    const searchable = [title, primary, ...secondary, ...aliases, ...semantic, excerpt, body].join(' ');
    if (!queryTokens.every((token) => searchable.includes(token))) return [];

    let score = 100;
    if (title === normalizedQuery) score = 260;
    else if (primary === normalizedQuery) score = 250;
    else if (title.includes(normalizedQuery)) score = 225;
    else if (primary.includes(normalizedQuery)) score = 215;
    else if ([...secondary, ...aliases].some((value) => value === normalizedQuery)) score = 205;
    else if ([...secondary, ...aliases].some((value) => value.includes(normalizedQuery))) score = 185;
    else if (semantic.some((value) => value.includes(normalizedQuery))) score = 165;
    else if (excerpt.includes(normalizedQuery)) score = 145;
    else if (body.includes(normalizedQuery)) score = 115;
    score += Math.min(queryTokens.length * 2, 12);

    return [{
      entity_type: 'condition',
      entity_id: record.id,
      slug: record.slug,
      title: record.title,
      subtitle: 'الموسوعة النفسية — دليل سريري موثق',
      excerpt: record.excerpt,
      destination: record.canonical_url,
      score,
    }];
  }).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'ar')).slice(0, limit);
}

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const p = await searchParams;
  const q = String(p.q ?? '').trim().replace(/\s+/g, ' ').slice(0, 160);
  const type = allowed.has(String(p.type ?? '')) ? String(p.type) as T : '';
  let results: R[] = [];
  let error = '';

  if (q.length >= 2) {
    let dbData: R[] = [];
    let dbError = false;
    let approvedQuickInfo: Awaited<ReturnType<typeof getQuickInfoItems>> = [];

    try {
      const s = await createClient();
      const [{ data, error: e }, quickInfo] = await Promise.all([
        s.rpc('search_platform', { p_query: q, p_limit: 75 }),
        getQuickInfoItems(500),
      ]);
      dbData = (data ?? []) as R[];
      approvedQuickInfo = quickInfo;
      dbError = Boolean(e);
    } catch {
      dbError = true;
      try {
        approvedQuickInfo = await getQuickInfoItems(500);
      } catch {
        approvedQuickInfo = [];
      }
    }

    const approvedByStoredSlug = new Map(
      approvedQuickInfo.map((item) => [quickInfoContentSlug(item.routeSlug), item]),
    );

    const db = dbData.flatMap((item): R[] => {
      if (item.slug.startsWith('quick-info-')) {
        const approved = approvedByStoredSlug.get(item.slug);
        if (!approved) return [];
        return [{
          ...item,
          entity_type: 'content',
          subtitle: 'معلومة سريعة — محتوى مراجع',
          destination: approved.canonicalUrl,
        }];
      }

      if (item.destination.startsWith('/encyclopedia/') || psychReleaseSlugs.has(item.slug)) {
        return [{ ...item, entity_type: 'condition', subtitle: item.subtitle || 'الموسوعة النفسية' }];
      }
      return [item];
    });

    const generated = searchCognitivePages(q, 75).map((x, i): R => ({
      entity_type: 'content',
      entity_id: `cognitive:${x.slug}`,
      slug: x.slug,
      title: x.title,
      subtitle: `${x.categoryName} — موسوعة العمليات المعرفية`,
      excerpt: x.excerpt,
      destination: `/content/${x.slug}`,
      score: 150 - i / 100,
    }));

    const psych = searchPsychEncyclopedia(q, 75);
    const by = new Map<string, R>();
    for (const x of [...db, ...generated, ...psych]) {
      const old = by.get(x.destination);
      if (!old || Number(x.score) > Number(old.score)) by.set(x.destination, x);
    }
    results = [...by.values()]
      .sort((a, b) => Number(b.score) - Number(a.score) || a.title.localeCompare(b.title, 'ar'))
      .slice(0, 100);
    if (dbError && generated.length === 0 && psych.length === 0) error = 'تعذر تنفيذ البحث الآن.';
  }

  const visible = type ? results.filter((x) => x.entity_type === type) : results;
  const counts = new Map<T, number>();
  for (const x of results) counts.set(x.entity_type, (counts.get(x.entity_type) ?? 0) + 1);
  const url = (t: string) => `/search?q=${encodeURIComponent(q)}${t ? `&type=${encodeURIComponent(t)}` : ''}`;

  return <>
    <SiteHeader />
    <main className="search-page-shell">
      <section className="search-hero">
        <span className="eyebrow">بحث موحد ودلالي</span>
        <h1>ابحث في منصة روافد</h1>
        <p>المحتوى والقطاعات والأقسام والمختصون والمراكز والموسوعات المعرفية والنفسية ضمن محرك واحد.</p>
        <form className="search search-page-form" action="/search" method="get" role="search">
          <label className="sr-only" htmlFor="platform-search">عبارة البحث</label>
          <input id="platform-search" name="q" type="search" minLength={2} maxLength={160} defaultValue={q} placeholder="مثال: القلق الاجتماعي، اضطراب الهلع، الذاكرة العاملة، مختص في عمّان..." autoComplete="off" />
          <button type="submit">بحث</button>
        </form>
      </section>
      {q.length > 0 && q.length < 2 && <div className="search-state"><h2>اكتب حرفين على الأقل</h2></div>}
      {error && <div className="search-state error"><h2>تعذر البحث</h2><p>{error}</p></div>}
      {q.length >= 2 && !error && <>
        <nav className="search-filters" aria-label="تصفية نتائج البحث">
          <Link className={!type ? 'active' : ''} href={url('')}>الكل <span>{results.length.toLocaleString('ar')}</span></Link>
          {(Object.entries(labels) as Array<[T, string]>).map(([k, v]) => <Link className={type === k ? 'active' : ''} href={url(k)} key={k}>{v} <span>{(counts.get(k) ?? 0).toLocaleString('ar')}</span></Link>)}
        </nav>
        <section className="search-results" aria-live="polite">
          <div className="search-summary"><strong>{visible.length.toLocaleString('ar')}</strong><span>نتيجة لعبارة «{q}»</span></div>
          {visible.length === 0 && <div className="search-state"><h2>لا توجد نتائج مطابقة</h2><p>جرّب مرادفًا أو مصطلحًا أوسع.</p></div>}
          <div className="search-result-list">
            {visible.map((x) => <article className="search-result-card" key={`${x.entity_type}-${x.entity_id}`}>
              <div className="result-type">{labels[x.entity_type]}</div>
              <div className="result-copy">
                <Link href={x.destination}><h2>{x.title}</h2></Link>
                {x.subtitle && <div className="result-subtitle">{x.subtitle}</div>}
                {x.excerpt && <p>{x.excerpt}</p>}
              </div>
              <Link className="result-open" href={x.destination}>فتح</Link>
            </article>)}
          </div>
        </section>
      </>}
    </main>
    <SiteFooter />
  </>;
}
