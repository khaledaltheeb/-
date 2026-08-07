import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'جاهزية SEO', robots: { index: false, follow: false, noarchive: true } };

type Metric = { label: string; count: number; note: string; tone?: 'ok' | 'warn' | 'danger' };

const medicalTypes = ['article','guide','research','condition','protocol','intervention','assessment'];

export default async function SeoDashboard() {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  if (!userId) redirect('/login?next=/admin/seo');
  const { data: profile } = await supabase.from('profiles').select('role,is_active').eq('id', userId).single();
  if (!profile?.is_active || !['owner','admin'].includes(profile.role)) redirect('/account');

  const now = new Date().toISOString();
  const [
    total, published, indexable, missingTitle, missingDescription, missingKeyword, missingCanonical,
    missingAuthor, missingReviewer, missingReviewedAt, missingReferences, missingDisclaimer, missingImageAlt,
    redirectCount, sectorCount, categoryCount, specialistCount, centerCount,
  ] = await Promise.all([
    supabase.from('content').select('id',{count:'exact',head:true}),
    supabase.from('content').select('id',{count:'exact',head:true}).eq('status','published').lte('published_at',now),
    supabase.from('content').select('id',{count:'exact',head:true}).eq('status','published').lte('published_at',now).eq('robots_index',true),
    supabase.from('content').select('id',{count:'exact',head:true}).or('seo_title.is.null,seo_title.eq.'),
    supabase.from('content').select('id',{count:'exact',head:true}).or('seo_description.is.null,seo_description.eq.'),
    supabase.from('content').select('id',{count:'exact',head:true}).or('primary_keyword.is.null,primary_keyword.eq.'),
    supabase.from('content').select('id',{count:'exact',head:true}).or('canonical_url.is.null,canonical_url.eq.'),
    supabase.from('content').select('id',{count:'exact',head:true}).or('author_display_name.is.null,author_display_name.eq.'),
    supabase.from('content').select('id',{count:'exact',head:true}).in('content_type',medicalTypes).or('reviewer_display_name.is.null,reviewer_display_name.eq.'),
    supabase.from('content').select('id',{count:'exact',head:true}).in('content_type',medicalTypes).is('last_reviewed_at',null),
    supabase.from('content').select('id',{count:'exact',head:true}).in('content_type',medicalTypes).eq('references_json','[]'),
    supabase.from('content').select('id',{count:'exact',head:true}).in('content_type',medicalTypes).or('medical_disclaimer.is.null,medical_disclaimer.eq.'),
    supabase.from('content').select('id',{count:'exact',head:true}).not('featured_image_url','is',null).or('featured_image_alt.is.null,featured_image_alt.eq.'),
    supabase.from('redirects').select('id',{count:'exact',head:true}).eq('is_active',true),
    supabase.from('sectors').select('id',{count:'exact',head:true}).eq('is_active',true).eq('visibility','public'),
    supabase.from('categories').select('id',{count:'exact',head:true}).eq('is_active',true).eq('visibility','public'),
    supabase.from('specialists').select('id',{count:'exact',head:true}).eq('verification','verified').eq('is_active',true),
    supabase.from('centers').select('id',{count:'exact',head:true}).eq('verification','verified').eq('is_active',true),
  ]);

  const number = (value: number | null) => value ?? 0;
  const totalCount = number(total.count);
  const publishedCount = number(published.count);
  const issues = [missingTitle,missingDescription,missingKeyword,missingCanonical,missingAuthor,missingReviewer,missingReviewedAt,missingReferences,missingDisclaimer,missingImageAlt].reduce((sum,item)=>sum+number(item.count),0);
  const readiness = totalCount === 0 ? 100 : Math.max(0, Math.round((1 - issues / Math.max(totalCount * 10,1)) * 100));

  const metrics: Metric[] = [
    { label:'SEO Title ناقص', count:number(missingTitle.count), note:'العنوان الأساسي قبل إضافة اسم المنصة.', tone:number(missingTitle.count)?'danger':'ok' },
    { label:'Meta Description ناقص', count:number(missingDescription.count), note:'يجب أن يكون 150–160 حرفًا قبل الاعتماد.', tone:number(missingDescription.count)?'danger':'ok' },
    { label:'Primary Keyword ناقص', count:number(missingKeyword.count), note:'الكلمة الأساسية ونية البحث جزء من عقد النشر.', tone:number(missingKeyword.count)?'warn':'ok' },
    { label:'Canonical ناقص', count:number(missingCanonical.count), note:'Release Gate يولّد مسارًا نسبيًا تلقائيًا عند الحاجة.', tone:number(missingCanonical.count)?'warn':'ok' },
    { label:'Author ناقص', count:number(missingAuthor.count), note:'هوية المؤلف مطلوبة للثقة والمحتوى المنشور.', tone:number(missingAuthor.count)?'warn':'ok' },
    { label:'Scientific Reviewer ناقص', count:number(missingReviewer.count), note:'مطلوب لأنواع YMYL الصحية قبل الاعتماد.', tone:number(missingReviewer.count)?'danger':'ok' },
    { label:'Last Reviewed ناقص', count:number(missingReviewedAt.count), note:'تاريخ المراجعة العلمية جزء من E-E-A-T.', tone:number(missingReviewedAt.count)?'warn':'ok' },
    { label:'References ناقصة', count:number(missingReferences.count), note:'مرجع علمي واحد على الأقل لأنواع YMYL.', tone:number(missingReferences.count)?'danger':'ok' },
    { label:'Medical Disclaimer ناقص', count:number(missingDisclaimer.count), note:'التنبيه الطبي إلزامي للمحتوى الصحي المحدد.', tone:number(missingDisclaimer.count)?'danger':'ok' },
    { label:'Alt للصورة ناقص', count:number(missingImageAlt.count), note:'أي صورة بارزة يجب أن تملك وصفًا بديلًا.', tone:number(missingImageAlt.count)?'warn':'ok' },
  ];

  return <main className="dashboard-shell"><section className="dashboard-card seo-dashboard-card">
    <div className="admin-heading"><div><span className="eyebrow">SEO · E-E-A-T · YMYL</span><h1>جاهزية البحث والثقة</h1><p>لوحة فحص بنيوية قبل النشر. لا تستبدل أدوات Google بعد الإطلاق، لكنها تمنع خروج الصفحات من Workflow وهي ناقصة المتطلبات التي تعتمدها روافد.</p></div><div className="dashboard-actions"><Link className="button" href="/admin/content">المحتوى</Link><Link className="button" href="/admin/redirects">Redirects</Link></div></div>

    <div className="seo-score-panel"><div className="seo-score"><strong>{readiness}%</strong><span>جاهزية داخلية</span></div><div><h2>Production Origin</h2><code dir="ltr">{SITE_URL}</code><p>الروابط الداخلية نسبية، بينما Canonical وSchema وSitemaps تُبنى من هذا الأصل المركزي.</p></div></div>

    <div className="admin-stat-grid seo-overview-grid"><article><strong>{totalCount}</strong><span>كل المحتوى</span></article><article><strong>{publishedCount}</strong><span>منشور</span></article><article><strong>{number(indexable.count)}</strong><span>منشور قابل للفهرسة</span></article><article><strong>{issues}</strong><span>ملاحظات داخلية</span></article></div>

    <section className="portal-section"><div className="section-mini-heading"><div><h2>عقد الصفحة</h2><span>الحقول التي يراقبها Release Gate وCMS.</span></div></div><div className="seo-check-grid">{metrics.map((metric)=><article className={`seo-check ${metric.tone??'ok'}`} key={metric.label}><div><strong>{metric.label}</strong><span>{metric.note}</span></div><b>{metric.count}</b></article>)}</div></section>

    <section className="portal-section"><div className="section-mini-heading"><div><h2>سطوح الفهرسة العامة</h2><span>المصادر التي تدخل Sitemap والبحث عندما يتم تفعيل الفهرسة.</span></div></div><div className="seo-surface-grid"><article><strong>{number(sectorCount.count)}</strong><span>قطاعات عامة</span></article><article><strong>{number(categoryCount.count)}</strong><span>أقسام عامة</span></article><article><strong>{number(specialistCount.count)}</strong><span>مختصون موثقون</span></article><article><strong>{number(centerCount.count)}</strong><span>مراكز موثقة</span></article><article><strong>{number(redirectCount.count)}</strong><span>Redirects نشطة</span></article></div></section>

    <section className="portal-section seo-contract-notes"><div className="section-mini-heading"><h2>قواعد الإطلاق</h2><span>مطبقة في الثيم والبنية</span></div><div className="admin-module-grid"><div><strong>Robots</strong><span>الفهرسة العامة تبقى مغلقة أثناء بناء الثيم وتُفتح بمتغير إطلاق مركزي.</span></div><div><strong>Canonical</strong><span>روابط الصفحات الداخلية تبقى Relative لمنع تعديل الروابط عند ربط الدومين.</span></div><div><strong>Structured Data</strong><span>Organization وBreadcrumbs وArticle/MedicalWebPage وملفات الدليل حسب البيانات الحقيقية.</span></div><div><strong>Sitemaps</strong><span>خرائط منفصلة للمحتوى والتصنيف والمختصين والمراكز والمجتمع.</span></div><div><strong>Local SEO</strong><span>المراكز والمختصون يدعمون الموقع والعنوان والترخيص وبيانات التواصل المسموح بها.</span></div><div><strong>Internal Linking</strong><span>المحتوى المرتبط يعتمد القطاع والقسم والمصطلحات الدلالية.</span></div></div></section>
  </section></main>;
}
