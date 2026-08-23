import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';

export const metadata = buildSeoMetadata({
  title: 'كيفية الاستشهاد بمنصة روافد',
  description: 'صيغة مقترحة للاستشهاد بمنصة روافد أو بصفحة محددة مع العنوان والرابط الدائم وتاريخ الاطلاع، إضافة إلى مثال BibTeX.',
  path: '/citation',
  index: true,
  follow: true,
});

export default function CitationPage() {
  const year = new Date().getUTCFullYear();
  const date = new Date().toISOString().slice(0, 10);
  const accessed = new Intl.DateTimeFormat('ar', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date());
  const bib = `@misc{rawafid_${year},\n  title={منصة روافد: معرفة نفسية وتربوية عربية},\n  author={منصة روافد},\n  year={${year}},\n  url={${SITE_URL}/},\n  note={Accessed: ${date}}\n}`;
  return <><SiteHeader/><main className="page-shell"><section className="content-hero"><span className="eyebrow">الاستشهاد والاستخدام الأكاديمي</span><h1>كيفية الاستشهاد بمنصة روافد</h1><p>عند الاستشهاد بمادة بعينها، فضّل عنوان الصفحة ورابطها الدائم وتاريخ الاطلاع بدل الاستشهاد بالموقع كله.</p></section><section className="content-shell"><div className="content-card"><h2>صيغة عربية مختصرة</h2><p>منصة روافد. ({year}). <em>منصة روافد: معرفة نفسية وتربوية عربية</em>. {SITE_URL}/. تاريخ الاطلاع: {accessed}.</p><h2>صفحة محددة</h2><p>اكتب: الجهة أو المؤلف الظاهر، عنوان الصفحة، تاريخ النشر أو آخر مراجعة إن كان ظاهرًا، الرابط الدائم، وتاريخ الاطلاع. وإذا كانت الصفحة تعرض مصدرًا أصليًا لادعاء تستخدمه أكاديميًا، فالأفضل الاستشهاد بالمصدر الأصلي مباشرة.</p><h2>BibTeX</h2><pre><code>{bib}</code></pre><h2>ملاحظة منهجية</h2><p>صفحات روافد مصادر تثقيفية وتجميعية؛ لا تجعل الاستشهاد بها بديلًا عن الأوراق البحثية أو الإرشادات المهنية الأصلية عندما تكون تلك هي الأدلة المناسبة للسؤال الأكاديمي.</p></div></section></main><SiteFooter/></>;
}
