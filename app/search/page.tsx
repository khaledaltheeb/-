import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'البحث في منصة روافد',
  description: 'البحث الموحد في محتوى روافد والقطاعات والأقسام والمختصين والمراكز والمتدربين والمتطوعين.',
  alternates: { canonical: '/search' },
  robots: { index: false, follow: true, noarchive: true },
};

type SearchParams = Promise<{ q?: string; type?: string }>;
type SearchResult = { entity_type: 'content' | 'sector' | 'category' | 'specialist' | 'center' | 'community'; entity_id: string; slug: string; title: string; subtitle: string | null; excerpt: string | null; destination: string; score: number };

const TYPE_LABELS: Record<string, string> = { content: 'المحتوى', sector: 'القطاعات', category: 'الأقسام', specialist: 'المختصون', center: 'المراكز', community: 'المتدربون والمتطوعون' };
const ALLOWED_TYPES = new Set(Object.keys(TYPE_LABELS));

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = String(params.q ?? '').trim().slice(0, 160);
  const requestedType = String(params.type ?? '').trim();
  const type = ALLOWED_TYPES.has(requestedType) ? requestedType : '';
  let results: SearchResult[] = [];
  let errorMessage = '';

  if (query.length >= 2) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('search_platform', { p_query: query, p_limit: 50 });
    if (error) errorMessage = 'تعذر تنفيذ البحث الآن.';
    else results = Array.isArray(data) ? data as SearchResult[] : [];
  }
  const visibleResults = type ? results.filter((item) => item.entity_type === type) : results;
  const counts = new Map<string, number>();
  for (const result of results) counts.set(result.entity_type, (counts.get(result.entity_type) ?? 0) + 1);
  const paramsFor = (nextType: string) => `/search?q=${encodeURIComponent(query)}${nextType ? `&type=${encodeURIComponent(nextType)}` : ''}`;

  return (
    <>
      <SiteHeader />
      <main className="search-page-shell">
        <section className="search-hero">
          <span className="eyebrow">بحث موحد ودلالي</span>
          <h1>ابحث في روافد</h1>
          <p>المحتوى والقطاعات والأقسام والمختصون والمراكز والمتدربون والمتطوعون ضمن محرك واحد، مع أوزان أعلى للعناوين والكلمات الأساسية والمصطلحات الدلالية.</p>
          <form className="search search-page-form" action="/search" method="get" role="search">
            <label className="sr-only" htmlFor="platform-search">عبارة البحث</label>
            <input id="platform-search" name="q" type="search" minLength={2} maxLength={160} defaultValue={query} placeholder="مثال: القلق، علاج معرفي سلوكي، مختص في عمّان..." autoComplete="off" />
            <button type="submit">بحث</button>
          </form>
        </section>

        {query.length > 0 && query.length < 2 && <div className="search-state"><h2>اكتب حرفين على الأقل</h2><p>يساعد ذلك على تقديم نتائج أدق وتقليل الاستعلامات العامة جدًا.</p></div>}
        {errorMessage && <div className="search-state error"><h2>تعذر البحث</h2><p>{errorMessage}</p></div>}

        {query.length >= 2 && !errorMessage && <>
          <nav className="search-filters" aria-label="تصفية نتائج البحث">
            <Link className={!type ? 'active' : ''} href={paramsFor('')}>الكل <span>{results.length}</span></Link>
            {Object.entries(TYPE_LABELS).map(([key, label]) => <Link className={type === key ? 'active' : ''} href={paramsFor(key)} key={key}>{label} <span>{counts.get(key) ?? 0}</span></Link>)}
          </nav>
          <section className="search-results" aria-live="polite">
            <div className="search-summary"><strong>{visibleResults.length}</strong><span>نتيجة لعبارة «{query}»</span></div>
            {visibleResults.length === 0 && <div className="search-state"><h2>لا توجد نتائج مطابقة حاليًا</h2><p>جرّب مرادفًا أو مصطلحًا أوسع، أو أزل تصفية نوع النتيجة.</p></div>}
            <div className="search-result-list">
              {visibleResults.map((result) => <article className="search-result-card" key={`${result.entity_type}-${result.entity_id}`}>
                <div className="result-type">{TYPE_LABELS[result.entity_type] ?? result.entity_type}</div>
                <div className="result-copy"><Link href={result.destination}><h2>{result.title}</h2></Link>{result.subtitle && <div className="result-subtitle">{result.subtitle}</div>}{result.excerpt && <p>{result.excerpt}</p>}</div>
                <Link className="result-open" href={result.destination}>فتح</Link>
              </article>)}
            </div>
          </section>
        </>}
      </main>
      <SiteFooter />
    </>
  );
}
