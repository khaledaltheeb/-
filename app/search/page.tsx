import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { searchCognitivePages } from '@/lib/cognitive-program';
import { getQuickInfoItems, quickInfoContentSlug } from '@/lib/quick-info';
import {
  getPsychEncyclopediaReleaseIndex,
  type PsychEncyclopediaReleaseIndexRecord,
} from '@/lib/psych-encyclopedia-release';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'البحث في منصة روافد',
  description: 'البحث الموحد في محتوى منصة روافد والقطاعات والأقسام والمختصين والمراكز والموسوعات المعرفية والنفسية.',
  alternates: { canonical: '/search' },
  robots: { index: false, follow: true, noarchive: true },
};

export type PlatformSearchParams = Promise<{ q?: string; type?: string }>;
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

function searchPsychEncyclopedia(query: string, records: PsychEncyclopediaReleaseIndexRecord[], limit = 75): R[] {
  const normalizedQuery = normalizeSearch(query);
  const queryTokens = normalizedQuery.split(' ').filter(Boolean);
  if (!normalizedQuery || queryTokens.length === 0) return [];

  return records.flatMap((record): R[] => {
    const title = normalizeSearch(record.title);
    const primary = normalizeSearch(record.primary_keyword ?? '');
    const secondary = record.secondary_keywords.map(normalizeSearch);
    const aliases = record.search_aliases.map(normalizeSearch);
    const semantic = record.semantic_terms.map(normalizeSearch);
    const intentQuestions = record.search_intent_questions.map(normalizeSearch);
    const excerpt = normalizeSearch(record.excerpt ?? '');
    const searchable = [title, primary, ...secondary, ...aliases, ...semantic, ...intentQuestions, excerpt].join(' ');
    if (!queryTokens.every((token) => searchable.includes(token))) return [];

    let score = 100;
    if (title === normalizedQuery) score = 260;
    else if (primary === normalizedQuery) score = 250;
    else if (title.includes(normalizedQuery)) score = 225;
    else if (primary.includes(normalizedQuery)) score = 215;
    else if ([...secondary, ...aliases].some((value) => value === normalizedQuery)) score = 205;
    else if ([...secondary, ...aliases].some((value) => value.includes(normalizedQuery))) score = 185;
    else if (semantic.some((value) => value.includes(normalizedQuery))) score = 165;
    else if (intentQuestions.some((value) => value.includes(normalizedQuery))) score = 155;
    else if (excerpt.includes(normalizedQuery)) score = 145;
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

type SearchExperienceProps = {
  searchParams: PlatformSearchParams;
  routeBase?: '/search' | '/ai-search';
  legacyIntro?: boolean;
};

export async function PlatformSearchExperience({ searchParams, routeBase = '/search', legacyIntro = false }: SearchExperienceProps) {
  const p = await searchParams;
  const q = String(p.q ?? '').trim().replace(/\s+/g, ' ').slice(0, 160);
  const type = allowed.has(String(p.type ?? '')) ? String(p.type) as T : '';
  let results: R[] = [];
  let error = '';

  if (q.length >= 2) {
    let dbData: R[] = [];
    let dbError = false;
    let approvedQuickInfo: Awaited<ReturnType<typeof getQuickInfoItems>> = [];
    let psychIndex: PsychEncyclopediaReleaseIndexRecord[] = [];

    try {
      psychIndex = await getPsychEncyclopediaReleaseIndex();
    } catch {
      psychIndex = [];
    }

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

    const psychReleaseSlugs = new Set(psychIndex.map((record) => record.slug));
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

    const psych = searchPsychEncyclopedia(q, psychIndex, 75);
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
  const url = (t: string) => `${routeBase}?q=${encodeURIComponent(q)}${t ? `&type=${encodeURIComponent(t)}` : ''}`;

  return <>
    <SiteHeader />
    <main className="search-page-shell">
      <section className="search-hero">
        <span className="eyebrow">بحث موحد ودلالي</span>
        <h1>{legacyIntro ? 'اكتب سؤالك بلغتك الطبيعية' : 'ابحث في منصة روافد'}</h1>
        <p>{legacyIntro ? 'هذا هو مسار البحث الذكي التاريخي بعد نقله إلى محرك روافد الحالي. اكتب المصطلح أو السؤال كما تفكر فيه، وسيبحث المحرك في المحتوى والقطاعات والمختصين والمراكز والموسوعات المعرفية والنفسية.' : 'المحتوى والقطاعات والأقسام والمختصون والمراكز والموسوعات المعرفية والنفسية ضمن محرك واحد.'}</p>
        <form className="search search-page-form" action={routeBase} method="get" role="search">
          <label className="sr-only" htmlFor={legacyIntro ? 'legacy-platform-search' : 'platform-search'}>عبارة البحث</label>
          <input id={legacyIntro ? 'legacy-platform-search' : 'platform-search'} name="q" type="search" minLength={2} maxLength={160} defaultValue={q} placeholder="مثال: القلق الاجتماعي، اضطراب الهلع، الذاكرة العاملة، مختص في عمّان..." autoComplete="off" />
          <button type="submit">بحث</button>
        </form>
      </section>
      {legacyIntro && <section className="search-state" aria-labelledby="legacy-search-method">
        <h2 id="legacy-search-method">كيف نُقلت وظيفة البحث الذكي؟</h2>
        <p>احتفظنا بالفكرة المفيدة من الصفحة القديمة بدل تحويل عنوانها: البحث باللغة الطبيعية والمرادفات، وإظهار النتائج من أكثر من نوع محتوى. أفضل استعلام عادةً جملة قصيرة واضحة؛ ويمكن تجربة مرادف أو مصطلح تقني عندما لا تظهر النتيجة المقصودة.</p>
        <p>المحرك الحالي يجمع نتائج قاعدة المنصة مع فهرس الموسوعة النفسية ومحتوى العمليات المعرفية، ثم يوحّد الوجهات المتكررة ويرتبها بحسب درجة المطابقة. لذلك لا تعتمد النتائج على قائمة المصطلحات القديمة الثابتة.</p>
        <p><strong>حد مهم:</strong> البحث أداة للوصول إلى المعرفة، وليس محرك تشخيص. في الموضوعات الصحية أو النفسية الحساسة ارجع إلى الصفحة الكاملة ومراجعها وحدودها بدل بناء قرار شخصي على مقتطف نتيجة البحث.</p>
      </section>}
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

export default async function SearchPage({ searchParams }: { searchParams: PlatformSearchParams }) {
  return <PlatformSearchExperience searchParams={searchParams} />;
}
