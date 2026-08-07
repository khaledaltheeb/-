import type { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'البحث',
  description: 'البحث داخل محتوى منصة روافد والقطاعات والأقسام والمختصين والمراكز.',
  robots: { index: false, follow: true },
};

type SearchParams = Promise<{ q?: string; type?: string }>;
type ResultRow = {
  entity_type: string;
  entity_id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  destination: string;
  score: number;
};

const FILTERS = [
  ['all', 'الكل'],
  ['content', 'المحتوى'],
  ['sector', 'القطاعات'],
  ['category', 'الأقسام'],
  ['specialist', 'المختصون'],
  ['center', 'المراكز'],
] as const;

const TYPE_LABELS: Record<string, string> = {
  content: 'محتوى',
  sector: 'قطاع',
  category: 'قسم',
  specialist: 'مختص',
  center: 'مركز',
};

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = String(params.q ?? '').trim().slice(0, 160);
  const requestedType = String(params.type ?? 'all');
  const activeType = FILTERS.some(([value]) => value === requestedType) ? requestedType : 'all';

  let results: ResultRow[] = [];
  let searchError = false;

  if (q.length >= 2) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc('search_platform', { p_query: q, p_limit: 50 });
    searchError = Boolean(error);
    results = Array.isArray(data) ? data.map((row: ResultRow) => row) : [];
  }

  const visible = activeType === 'all' ? results : results.filter((row) => row.entity_type === activeType);
  const counts = new Map<string, number>();
  for (const row of results) counts.set(row.entity_type, (counts.get(row.entity_type) ?? 0) + 1);

  return (
    <main className="search-page-shell">
      <header className="search-page-header">
        <Link className="brand" href="/" aria-label="منصة روافد الرئيسية">
          <span className="brand-mark">ر</span>
          <span><strong>روافد</strong><small>Rawafid</small></span>
        </Link>
        <Link className="button" href="/">الرئيسية</Link>
      </header>

      <section className="search-hero">
        <span className="eyebrow">Unified Search</span>
        <h1>ابحث في منصة روافد</h1>
        <p>بحث موحد في المحتوى المنشور والقطاعات والأقسام والمختصين والمراكز الموثقة.</p>
        <form className="search search-page-form" action="/search" method="get" role="search">
          <input name="q" aria-label="كلمة البحث" defaultValue={q} minLength={2} maxLength={160} placeholder="مثال: القلق، التعافي، مختص، مركز..." autoComplete="off" />
          <button type="submit">بحث</button>
        </form>
      </section>

      {q.length >= 2 && (
        <nav className="search-filters" aria-label="تصفية نتائج البحث">
          {FILTERS.map(([value, label]) => {
            const count = value === 'all' ? results.length : (counts.get(value) ?? 0);
            const href = `/search?q=${encodeURIComponent(q)}${value === 'all' ? '' : `&type=${value}`}`;
            return <Link className={activeType === value ? 'active' : ''} href={href} key={value}>{label}<span>{count}</span></Link>;
          })}
        </nav>
      )}

      <section className="search-results" aria-live="polite">
        {q.length < 2 && <div className="search-state"><h2>اكتب كلمتين على الأقل</h2><p>سيظهر هنا المحتوى والجهات المطابقة دون الحاجة إلى إنشاء حساب.</p></div>}
        {searchError && <div className="search-state error"><h2>تعذر تنفيذ البحث</h2><p>لم يتم عرض نتائج غير مؤكدة. حاول مرة أخرى.</p></div>}
        {!searchError && q.length >= 2 && visible.length === 0 && <div className="search-state"><h2>لا توجد نتائج مطابقة</h2><p>جرّب مرادفًا أو عبارة أقصر. محرك البحث يدعم المرادفات المخزنة لكل صفحة.</p></div>}

        {!searchError && visible.length > 0 && (
          <>
            <div className="search-summary"><strong>{visible.length}</strong><span>نتيجة لـ «{q}»</span></div>
            <div className="search-result-list">
              {visible.map((result) => (
                <article className="search-result-card" key={`${result.entity_type}-${result.entity_id}`}>
                  <div className="result-type">{TYPE_LABELS[result.entity_type] ?? result.entity_type}</div>
                  <div className="result-copy">
                    <Link href={result.destination}><h2>{result.title}</h2></Link>
                    {result.subtitle && <div className="result-subtitle">{result.subtitle}</div>}
                    {result.excerpt && <p>{result.excerpt}</p>}
                  </div>
                  <Link className="result-open" href={result.destination}>فتح</Link>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
