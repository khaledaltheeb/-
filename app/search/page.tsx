import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { searchCognitivePages } from '@/lib/cognitive-program';
import {
  getExpandedEncyclopediaIndex,
  type ExpandedEncyclopediaIndexRecord,
} from '@/lib/expanded-encyclopedia';
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

type QuickInfoGateRow = {
  slug: string | null;
  canonical_url: string | null;
  schema_json: unknown;
};

const labels: Record<T, string> = {
  content: 'المحتوى',
  condition: 'الموسوعة المختصرة',
  sector: 'القطاعات',
  category: 'الأقسام',
  specialist: 'المختصون',
  center: 'المراكز',
  community: 'المتدربون والمتطوعون',
};
const allowed = new Set(Object.keys(labels));

const discoveryLinks = [
  { href: '/sections/cognitive-processes', title: 'الموسوعة النفسية والمعرفية الموسعة', detail: 'مصطلحات نفسية وسريرية ومعرفية فريدة ضمن أقسام مترابطة ومراجع موثوقة.' },
  { href: '/encyclopedia/', title: 'الموسوعة المختصرة', detail: 'الحالات والاضطرابات النفسية في الصفحات التاريخية المحفوظة.' },
  { href: '/sectors', title: 'القطاعات', detail: 'ابدأ من المجال الرئيسي ثم انتقل إلى الأقسام المتخصصة.' },
  { href: '/sections', title: 'الأقسام', detail: 'خريطة موضوعية مرتبة للموضوعات والأقسام الفرعية.' },
  { href: '/care-guides/', title: 'أدلة التعامل والرعاية', detail: 'أدلة عملية للأسرة ومقدمي الرعاية حسب الموقف والحاجة.' },
  { href: '/evidence-guides/', title: 'الأدلة العلمية', detail: 'مكتبة تربط الأسئلة العملية بالمصادر الأصلية وحدود الدليل.' },
  { href: '/sectors/pediatric-oncology', title: 'سرطان الأطفال', detail: 'مركز موحد للتشخيص والعلاج والدعم والنجاة والمتابعة.' },
];

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

function isApprovedQuickInfoGateRow(row: QuickInfoGateRow) {
  if (!row.slug?.startsWith('quick-info-')) return false;
  const schema = row.schema_json && typeof row.schema_json === 'object' && !Array.isArray(row.schema_json)
    ? row.schema_json as Record<string, unknown>
    : null;
  if (!schema) return false;
  if (schema.page_role !== 'quick-info' || schema.publication_ready !== true || schema.editorial_review_required !== false) return false;
  const routeSlug = row.slug.slice('quick-info-'.length);
  if (!/^[a-z0-9][a-z0-9-]*$/.test(routeSlug)) return false;
  const expectedCanonical = `/quick-info/${routeSlug}/`;
  const storedCanonical = typeof row.canonical_url === 'string' ? row.canonical_url.trim() : '';
  return !storedCanonical || storedCanonical === expectedCanonical;
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
      subtitle: 'الموسوعة المختصرة — دليل سريري موثق',
      excerpt: record.excerpt,
      destination: record.canonical_url,
      score,
    }];
  }).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'ar')).slice(0, limit);
}

function searchExpandedEncyclopedia(query: string, records: ExpandedEncyclopediaIndexRecord[], limit = 75): R[] {
  const normalizedQuery = normalizeSearch(query);
  const queryTokens = normalizedQuery.split(' ').filter(Boolean);
  if (!normalizedQuery || queryTokens.length === 0) return [];

  return records.flatMap((record): R[] => {
    const canonicalTerm = normalizeSearch(record.canonical_term);
    const englishName = normalizeSearch(record.english_name ?? '');
    const title = normalizeSearch(record.title);
    const primary = normalizeSearch(record.primary_keyword ?? '');
    const aliases = record.aliases.map(normalizeSearch);
    const secondary = record.secondary_keywords.map(normalizeSearch);
    const semantic = record.semantic_terms.map(normalizeSearch);
    const excerpt = normalizeSearch(record.excerpt ?? '');
    const searchable = [canonicalTerm, englishName, title, primary, ...aliases, ...secondary, ...semantic, excerpt].join(' ');
    if (!queryTokens.every((token) => searchable.includes(token))) return [];

    let score = 125;
    if (canonicalTerm === normalizedQuery) score = 320;
    else if (englishName === normalizedQuery) score = 310;
    else if (primary === normalizedQuery) score = 300;
    else if (aliases.some((value) => value === normalizedQuery)) score = 295;
    else if (title === normalizedQuery) score = 285;
    else if (canonicalTerm.includes(normalizedQuery)) score = 270;
    else if (primary.includes(normalizedQuery)) score = 260;
    else if (aliases.some((value) => value.includes(normalizedQuery))) score = 250;
    else if (secondary.some((value) => value.includes(normalizedQuery))) score = 225;
    else if (semantic.some((value) => value.includes(normalizedQuery))) score = 190;
    else if (excerpt.includes(normalizedQuery)) score = 170;
    score += Math.min(queryTokens.length * 2, 12);

    return [{
      entity_type: 'content',
      entity_id: record.id,
      slug: record.slug,
      title: record.title,
      subtitle: `${record.category_name} — الموسوعة الموسعة`,
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
    let approvedQuickInfoSlugs = new Set<string>();
    let psychIndex: PsychEncyclopediaReleaseIndexRecord[] = [];
    let expandedIndex: ExpandedEncyclopediaIndexRecord[] = [];

    try {
      psychIndex = await getPsychEncyclopediaReleaseIndex();
    } catch {
      psychIndex = [];
    }

    try {
      expandedIndex = await getExpandedEncyclopediaIndex();
    } catch {
      expandedIndex = [];
    }

    try {
      const s = await createClient();
      const { data, error: e } = await s.rpc('search_platform', { p_query: q, p_limit: 75 });
      dbData = (data ?? []) as R[];
      dbError = Boolean(e);

      if (!e) {
        const quickInfoSlugs = [...new Set(dbData.filter((item) => item.slug.startsWith('quick-info-')).map((item) => item.slug))];
        if (quickInfoSlugs.length > 0) {
          const { data: gateRows, error: gateError } = await s
            .from('content')
            .select('slug,canonical_url,schema_json')
            .in('slug', quickInfoSlugs)
            .eq('status', 'published')
            .eq('robots_index', true)
            .lte('published_at', new Date().toISOString());

          if (!gateError) {
            approvedQuickInfoSlugs = new Set(
              ((gateRows ?? []) as QuickInfoGateRow[])
                .filter(isApprovedQuickInfoGateRow)
                .map((row) => row.slug as string),
            );
          }
        }
      }
    } catch {
      dbError = true;
    }

    const psychReleaseSlugs = new Set(psychIndex.map((record) => record.slug));

    const db = dbData.flatMap((item): R[] => {
      if (item.slug.startsWith('quick-info-')) {
        if (!approvedQuickInfoSlugs.has(item.slug)) return [];
        const routeSlug = item.slug.slice('quick-info-'.length);
        return [{
          ...item,
          entity_type: 'content',
          subtitle: 'معلومة سريعة — محتوى مراجع',
          destination: `/quick-info/${routeSlug}/`,
        }];
      }

      if (item.destination.startsWith('/encyclopedia/') || psychReleaseSlugs.has(item.slug)) {
        return [{ ...item, entity_type: 'condition', subtitle: item.subtitle || 'الموسوعة المختصرة' }];
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

    const expanded = searchExpandedEncyclopedia(q, expandedIndex, 75);
    const psych = searchPsychEncyclopedia(q, psychIndex, 75);
    const by = new Map<string, R>();
    for (const x of [...db, ...expanded, ...generated, ...psych]) {
      const old = by.get(x.destination);
      if (!old || Number(x.score) > Number(old.score)) by.set(x.destination, x);
    }
    results = [...by.values()]
      .sort((a, b) => Number(b.score) - Number(a.score) || a.title.localeCompare(b.title, 'ar'))
      .slice(0, 100);
    if (dbError && generated.length === 0 && expanded.length === 0 && psych.length === 0) error = 'تعذر تنفيذ البحث الآن.';
  }

  const visible = type ? results.filter((x) => x.entity_type === type) : results;
  const counts = new Map<T, number>();
  for (const x of results) counts.set(x.entity_type, (counts.get(x.entity_type) ?? 0) + 1);
  const url = (t: string) => `${routeBase}?q=${encodeURIComponent(q)}${t ? `&type=${encodeURIComponent(t)}` : ''}`;

  return <>
    <SiteHeader />
    <main className="search-page-shell">
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">البحث</span></nav>
      <section className="search-hero">
        <span className="eyebrow">بحث موحد ودلالي</span>
        <h1>{legacyIntro ? 'اكتب سؤالك بلغتك الطبيعية' : 'ابحث في منصة روافد'}</h1>
        <p>{legacyIntro ? 'هذا هو مسار البحث الذكي التاريخي بعد نقله إلى محرك روافد الحالي. اكتب المصطلح أو السؤال كما تفكر فيه، وسيبحث المحرك في المحتوى والقطاعات والمختصين والمراكز والموسوعة الموسعة والموسوعة المختصرة.' : 'ابحث في المحتوى والقطاعات والأقسام والمختصين والمراكز والموسوعات من نقطة واحدة، ثم استخدم الفلاتر للوصول إلى النوع الأقرب لاحتياجك.'}</p>
        <form className="search search-page-form" action={routeBase} method="get" role="search">
          <label className="sr-only" htmlFor={legacyIntro ? 'legacy-platform-search' : 'platform-search'}>عبارة البحث</label>
          <input id={legacyIntro ? 'legacy-platform-search' : 'platform-search'} name="q" type="search" minLength={2} maxLength={160} defaultValue={q} placeholder="مثال: القلق الاجتماعي، فرط اليقظة، فقدان التلذذ، دعم الأسرة، مختص في عمّان..." autoComplete="off" />
          <button type="submit">بحث</button>
        </form>
        <nav className="search-discovery-links" aria-label="مسارات استكشاف سريعة">
          <Link href="/sections/cognitive-processes">الموسوعة الموسعة</Link>
          <Link href="/encyclopedia/">الموسوعة المختصرة</Link>
          <Link href="/sectors">القطاعات</Link>
          <Link href="/sections">الأقسام</Link>
          <Link href="/care-guides/">أدلة الرعاية</Link>
          <Link href="/evidence-guides/">الأدلة العلمية</Link>
          <Link href="/sectors/pediatric-oncology">سرطان الأطفال</Link>
        </nav>
      </section>
      {legacyIntro && <section className="search-state" aria-labelledby="legacy-search-method">
        <h2 id="legacy-search-method">كيف نُقلت وظيفة البحث الذكي؟</h2>
        <p>احتفظنا بالفكرة المفيدة من الصفحة القديمة بدل تحويل عنوانها: البحث باللغة الطبيعية والمرادفات، وإظهار النتائج من أكثر من نوع محتوى. أفضل استعلام عادةً جملة قصيرة واضحة؛ ويمكن تجربة مرادف أو مصطلح تقني عندما لا تظهر النتيجة المقصودة.</p>
        <p>المحرك الحالي يجمع نتائج قاعدة المنصة مع فهرس الموسوعة الموسعة والموسوعة المختصرة ومحتوى العمليات المعرفية، ثم يوحّد الوجهات المتكررة ويرتبها بحسب درجة المطابقة. لذلك لا تعتمد النتائج على قائمة المصطلحات القديمة الثابتة.</p>
        <p><strong>حد مهم:</strong> البحث أداة للوصول إلى المعرفة، وليس محرك تشخيص. في الموضوعات الصحية أو النفسية الحساسة ارجع إلى الصفحة الكاملة ومراجعها وحدودها بدل بناء قرار شخصي على مقتطف نتيجة البحث.</p>
      </section>}
      {!q && !legacyIntro && <section className="search-start" aria-labelledby="search-start-title">
        <div className="search-start-head"><span className="eyebrow">ابدأ من الخريطة المناسبة</span><h2 id="search-start-title">لست مضطرًا إلى معرفة المصطلح الدقيق</h2><p>يمكنك الدخول من مجال رئيسي أو مكتبة متخصصة، ثم تضييق المسار من داخلها.</p></div>
        <div className="search-start-grid">{discoveryLinks.map((item) => <Link href={item.href} key={item.href}><strong>{item.title}</strong><span>{item.detail}</span><small>استكشف ←</small></Link>)}</div>
      </section>}
      {q.length > 0 && q.length < 2 && <div className="search-state"><h2>اكتب حرفين على الأقل</h2><p>استخدم كلمة أو عبارة قصيرة تصف الموضوع الذي تبحث عنه.</p></div>}
      {error && <div className="search-state error"><h2>تعذر البحث</h2><p>{error}</p></div>}
      {q.length >= 2 && !error && <>
        <nav className="search-filters" aria-label="تصفية نتائج البحث">
          <Link className={!type ? 'active' : ''} href={url('')}>الكل <span>{results.length.toLocaleString('ar')}</span></Link>
          {(Object.entries(labels) as Array<[T, string]>).map(([k, v]) => <Link className={type === k ? 'active' : ''} href={url(k)} key={k}>{v} <span>{(counts.get(k) ?? 0).toLocaleString('ar')}</span></Link>)}
        </nav>
        <section className="search-results" aria-live="polite">
          <div className="search-summary"><strong>{visible.length.toLocaleString('ar')}</strong><span>نتيجة لعبارة «{q}»</span></div>
          {visible.length === 0 && <div className="search-state search-empty"><h2>لا توجد نتائج مطابقة</h2><p>جرّب مرادفًا أو مصطلحًا أوسع، أو انتقل مباشرة إلى إحدى المكتبات الرئيسية.</p><div className="search-empty-links"><Link href="/sections/cognitive-processes">الموسوعة الموسعة</Link><Link href="/encyclopedia/">الموسوعة المختصرة</Link><Link href="/sections">الأقسام</Link><Link href="/care-guides/">أدلة الرعاية</Link><Link href="/evidence-guides/">الأدلة العلمية</Link></div></div>}
          <div className="search-result-list">
            {visible.map((x) => <article className="search-result-card" key={`${x.entity_type}-${x.entity_id}`}>
              <div className="result-type">{labels[x.entity_type]}</div>
              <div className="result-copy">
                <Link href={x.destination}><h2>{x.title}</h2></Link>
                {x.subtitle && <div className="result-subtitle">{x.subtitle}</div>}
                {x.excerpt && <p>{x.excerpt}</p>}
              </div>
              <Link className="result-open" href={x.destination}>عرض الصفحة ←</Link>
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
