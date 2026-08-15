import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { searchCognitivePages } from '@/lib/cognitive-program';
import { getQuickInfoItems, quickInfoContentSlug } from '@/lib/quick-info';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'البحث في منصة روافد',
  description: 'البحث الموحد في محتوى منصة روافد والقطاعات والأقسام والمختصين والمراكز والموسوعة المعرفية.',
  alternates: { canonical: '/search' },
  robots: { index: false, follow: true, noarchive: true },
};

type SP = Promise<{ q?: string; type?: string }>;
type T = 'content' | 'sector' | 'category' | 'specialist' | 'center' | 'community';
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
  sector: 'القطاعات',
  category: 'الأقسام',
  specialist: 'المختصون',
  center: 'المراكز',
  community: 'المتدربون والمتطوعون',
};
const allowed = new Set(Object.keys(labels));

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const p = await searchParams;
  const q = String(p.q ?? '').trim().replace(/\s+/g, ' ').slice(0, 160);
  const type = allowed.has(String(p.type ?? '')) ? String(p.type) as T : '';
  let results: R[] = [];
  let error = '';

  if (q.length >= 2) {
    const s = await createClient();
    const [{ data, error: e }, approvedQuickInfo] = await Promise.all([
      s.rpc('search_platform', { p_query: q, p_limit: 75 }),
      getQuickInfoItems(500),
    ]);

    const approvedByStoredSlug = new Map(
      approvedQuickInfo.map((item) => [quickInfoContentSlug(item.routeSlug), item]),
    );

    const db = ((data ?? []) as R[]).flatMap((item): R[] => {
      if (!item.slug.startsWith('quick-info-')) return [item];
      const approved = approvedByStoredSlug.get(item.slug);
      if (!approved) return [];
      return [{
        ...item,
        subtitle: 'معلومة سريعة — محتوى مراجع',
        destination: approved.canonicalUrl,
      }];
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

    const by = new Map<string, R>();
    for (const x of [...db, ...generated]) {
      const old = by.get(x.destination);
      if (!old || Number(x.score) > Number(old.score)) by.set(x.destination, x);
    }
    results = [...by.values()]
      .sort((a, b) => Number(b.score) - Number(a.score) || a.title.localeCompare(b.title, 'ar'))
      .slice(0, 100);
    if (e && generated.length === 0) error = 'تعذر تنفيذ البحث الآن.';
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
        <p>المحتوى والقطاعات والأقسام والمختصون والمراكز والموسوعة المعرفية ضمن محرك واحد.</p>
        <form className="search search-page-form" action="/search" method="get" role="search">
          <label className="sr-only" htmlFor="platform-search">عبارة البحث</label>
          <input id="platform-search" name="q" type="search" minLength={2} maxLength={160} defaultValue={q} placeholder="مثال: الذاكرة العاملة، الانتباه الانتقائي، مختص في عمّان..." autoComplete="off" />
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
