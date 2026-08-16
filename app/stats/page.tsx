import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = buildSeoMetadata({
  title: 'إحصاءات المحتوى في روافد',
  description: 'إحصاءات حية عن المحتوى والقطاعات العامة في منصة روافد، محسوبة من قاعدة النشر الحالية بدل الأرقام التاريخية القديمة.',
  path: '/stats',
  index: false,
  follow: true,
});

const typeLabels: Record<string, string> = {
  guide: 'أدلة', article: 'مقالات', research: 'مواد بحثية', resource: 'موارد', glossary_term: 'مصطلحات', condition: 'حالات', comparison: 'مقارنات', landing_page: 'بوابات',
};

export default async function StatsPage() {
  const supabase = await createClient();
  const [{ data: contentRows }, { data: sectors }, { data: categories }] = await Promise.all([
    supabase.from('content').select('content_type').eq('status', 'published').range(0, 4999),
    supabase.from('sectors').select('id').eq('is_active', true).eq('visibility', 'public').range(0, 499),
    supabase.from('categories').select('id').eq('is_active', true).eq('visibility', 'public').range(0, 4999),
  ]);
  const counts = new Map<string, number>();
  for (const row of contentRows ?? []) counts.set(row.content_type, (counts.get(row.content_type) ?? 0) + 1);
  const total = [...counts.values()].reduce((sum, value) => sum + value, 0);
  const types = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  return <><SiteHeader/><main className="site-shell sector-page-shell">
    <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">الإحصاءات</span></nav>
    <section className="public-index-hero"><span className="eyebrow">Live publishing snapshot</span><h1>إحصاءات المحتوى الحالية</h1><p>النسخة القديمة من هذه الصفحة كانت تعرض أرقام معجم تاريخي ثابتة. هذه النسخة لا تعيد تدوير تلك الأرقام؛ بل تحسب المؤشرات من قاعدة النشر الحالية، لذلك تعكس ما هو منشور الآن فقط ولا تشمل مسودات الهجرة أو المحتوى المستبعد.</p><div className="public-stat-strip"><span>{total.toLocaleString('ar')} مادة منشورة</span><span>{(sectors?.length ?? 0).toLocaleString('ar')} قطاعات عامة</span><span>{(categories?.length ?? 0).toLocaleString('ar')} تصنيفات عامة</span></div></section>
    <section aria-labelledby="by-type"><div className="section-mini-heading"><div><span className="eyebrow">حسب نوع المادة</span><h2 id="by-type">تركيب المحتوى المنشور</h2></div><span>لا تُحسب المسودات ولا المواد غير المعتمدة.</span></div><div className="institutional-sector-grid">{types.map(([type,count])=><article className="institutional-sector-card" key={type}><span className="sector-number">{count.toLocaleString('ar')}</span><h3>{typeLabels[type] || type}</h3><p>مواد بحالة published ضمن قاعدة المحتوى الحالية.</p></article>)}</div></section>
    <section className="trust-inline-note"><h2>كيف تقرأ هذه الأرقام؟</h2><p>العدد ليس مقياس جودة بمفرده. معيار النشر في روافد يشمل حالة المراجعة، المصادر، المسار، البيانات الوصفية وحدود الاستخدام. لهذا لا نرفع أرقام مسودات النقل إلى هذه الصفحة لمجرد أنها موجودة في قاعدة الهجرة.</p><Link href="/editorial-policy">السياسة التحريرية</Link> · <Link href="/medical-review-policy">سياسة المراجعة العلمية</Link></section>
  </main><SiteFooter/></>;
}
