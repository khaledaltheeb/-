import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { getDownloadTerms } from '@/lib/downloadable-terms';
import { buildSeoMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const metadata = buildSeoMetadata({
  title: 'تنزيل بيانات المصطلحات النفسية العربية',
  description: 'نزّل المصطلحات النفسية العربية المنشورة والمراجعة في روافد بصيغ JSON وCSV وTSV وفهرس بحث خفيف للاستخدام التعليمي والبحثي والتقني.',
  path: '/downloads',
  index: true,
  follow: true,
  keywords: ['مصطلحات نفسية عربية', 'بيانات علم النفس', 'JSON عربي', 'CSV مصطلحات نفسية', 'روافد'],
});

export default async function DownloadsPage() {
  let count = 0;
  try { count = (await getDownloadTerms()).length; } catch {}
  const files = [
    ['/downloads/psychology-terms-ar.json', 'JSON', 'للتطبيقات ومعالجة البيانات آليًا.'],
    ['/downloads/psychology-terms-ar.csv', 'CSV', 'للجداول والتحليل والاستيراد.'],
    ['/downloads/psychology-terms-ar.tsv', 'TSV', 'لتبادل البيانات النصية بعلامات التبويب.'],
    ['/api/search-index.json', 'فهرس JSON', 'فهرس خفيف للبحث والاقتراحات.'],
  ] as const;
  return <><SiteHeader/><main className="page-shell"><section className="content-hero"><span className="eyebrow">مجموعة بيانات عربية قابلة للقراءة آليًا</span><h1>تنزيل بيانات المصطلحات النفسية العربية</h1><p>الملفات تُبنى من المصطلحات <strong>المنشورة والمراجعة</strong> في روافد. العدد الحالي المتاح في مجموعة البيانات: {count.toLocaleString('ar')} مصطلحًا.</p></section><section className="content-shell"><div className="content-card"><h2>صيغ التنزيل</h2><p>الملفات تتولد عند الطلب لتعكس دورة النشر الحالية، ولا تتضمن المسودات أو المواد المؤرشفة أو سجلات الهجرة غير المعتمدة.</p><ul>{files.map(([href,label,desc])=><li key={href}><a href={href} download>{label}</a> — {desc}</li>)}</ul><h2>وصف مجموعة البيانات</h2><dl><div><dt>المعرّف</dt><dd>rawafid-psychology-terms-live</dd></div><div><dt>اللغة</dt><dd>العربية</dd></div><div><dt>الناشر</dt><dd>منصة روافد</dd></div><div><dt>سياسة الإدراج</dt><dd>المحتوى المنشور فقط</dd></div></dl><h2>الاستخدام والحدود</h2><p>البيانات للتثقيف والبحث والتكامل التقني. وجود مصطلح أو تعريف في الملف لا يجعله أداة تشخيص ولا يصلح وحده لاتخاذ قرار صحي فردي.</p></div></section></main><SiteFooter/></>;
}
