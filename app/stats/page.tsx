import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = buildSeoMetadata({
  title: 'إحصاءات محتوى منصة روافد | الصفحات والقطاعات والأقسام',
  description: 'إحصاءات حية ودقيقة عن المحتوى المنشور والقابل للفهرسة والقطاعات والأقسام العامة في منصة روافد، محسوبة مباشرة من قاعدة النشر الحالية.',
  path: '/stats',
  index: true,
  follow: true,
  keywords: ['إحصاءات روافد', 'عدد صفحات روافد', 'محتوى منصة روافد', 'قطاعات روافد', 'أقسام روافد', 'منصة روافد'],
});

const typeLabels: Record<string, string> = {
  glossary_term: 'مصطلحات',
  article: 'مقالات',
  guide: 'أدلة',
  research: 'مواد بحثية',
  condition: 'حالات',
  resource: 'موارد',
  landing_page: 'بوابات',
  learning_path: 'مسارات تعلم',
  comparison: 'مقارنات',
  directory_page: 'صفحات دليل',
  tool: 'أدوات',
  intervention: 'تدخلات',
  protocol: 'بروتوكولات',
};

type Snapshot = {
  total_published: number;
  indexable_published: number;
  public_sectors: number;
  public_categories: number;
  by_type: Record<string, number>;
  generated_at: string | null;
};

function asNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function normalizeSnapshot(value: unknown): Snapshot | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const rawByType = row.by_type && typeof row.by_type === 'object' && !Array.isArray(row.by_type)
    ? row.by_type as Record<string, unknown>
    : {};
  const byType = Object.fromEntries(
    Object.entries(rawByType)
      .map(([key, count]) => [key, asNumber(count)] as const)
      .filter(([, count]) => count > 0),
  );
  return {
    total_published: asNumber(row.total_published),
    indexable_published: asNumber(row.indexable_published),
    public_sectors: asNumber(row.public_sectors),
    public_categories: asNumber(row.public_categories),
    by_type: byType,
    generated_at: typeof row.generated_at === 'string' ? row.generated_at : null,
  };
}

async function loadSnapshot(): Promise<Snapshot | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('get_public_stats_snapshot');
  if (error) {
    console.error('STATS_SNAPSHOT_RPC_FAILED', error.message);
    return null;
  }
  return normalizeSnapshot(data);
}

export default async function StatsPage() {
  const snapshot = await loadSnapshot();
  const types = snapshot
    ? Object.entries(snapshot.by_type).sort((a, b) => b[1] - a[1])
    : [];
  const generatedAt = snapshot?.generated_at ? new Date(snapshot.generated_at) : null;

  return <><SiteHeader/><main className="site-shell sector-page-shell">
    <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">الإحصاءات</span></nav>
    <section className="public-index-hero"><span className="eyebrow">Live publishing snapshot</span><h1>إحصاءات المحتوى الحالية</h1><p>هذه الصفحة تحسب المؤشرات مباشرة من قاعدة النشر الحالية. لا تُحسب المسودات أو المواد غير المنشورة، ويظهر عدد المواد القابلة للفهرسة بصورة مستقلة حتى لا يختلط حجم المخزون بحالة الظهور في محركات البحث.</p>{snapshot ? <><div className="public-stat-strip"><span>{snapshot.total_published.toLocaleString('ar')} مادة منشورة</span><span>{snapshot.indexable_published.toLocaleString('ar')} قابلة للفهرسة</span><span>{snapshot.public_sectors.toLocaleString('ar')} قطاعًا عامًا</span><span>{snapshot.public_categories.toLocaleString('ar')} تصنيفًا عامًا</span></div>{generatedAt && Number.isFinite(generatedAt.getTime()) ? <p><small>آخر احتساب آلي: {new Intl.DateTimeFormat('ar', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Amman' }).format(generatedAt)}</small></p> : null}</> : <div className="trust-inline-note"><strong>تعذر تحديث لقطة الإحصاءات مؤقتًا.</strong><p>لم نعرض أرقامًا احتياطية أو قديمة حتى لا تظهر بيانات مضللة. أعد تحميل الصفحة لاحقًا.</p></div>}</section>
    <section aria-labelledby="by-type"><div className="section-mini-heading"><div><span className="eyebrow">حسب نوع المادة</span><h2 id="by-type">تركيب المحتوى المنشور</h2></div><span>المجموع يشمل جميع المواد المنشورة الحالية، وليس أول دفعة من السجلات.</span></div>{types.length ? <div className="institutional-sector-grid">{types.map(([type,count])=><article className="institutional-sector-card" key={type}><span className="sector-number">{count.toLocaleString('ar')}</span><h3>{typeLabels[type] || type}</h3><p>مواد منشورة من هذا النوع ضمن قاعدة المحتوى الحالية.</p></article>)}</div> : <p>تفاصيل الأنواع غير متاحة في لقطة الإحصاءات الحالية.</p>}</section>
    <section className="trust-inline-note"><h2>كيف تقرأ هذه الأرقام؟</h2><p>العدد ليس مقياس جودة بمفرده. معيار النشر في روافد يشمل حالة المراجعة، المصادر، المسار، البيانات الوصفية وحدود الاستخدام. لذلك لا تدخل مسودات الهجرة في هذه الأرقام لمجرد وجودها في قاعدة البيانات.</p><Link href="/editorial-policy">السياسة التحريرية</Link> · <Link href="/medical-review-policy">سياسة المراجعة العلمية</Link></section>
  </main><SiteFooter/></>;
}
