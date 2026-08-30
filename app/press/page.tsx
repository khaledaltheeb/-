import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { BRAND_NAME, SITE_URL, buildSeoMetadata } from '@/lib/seo';
import { FOUNDER_DISPLAY_NAME, FOUNDER_GITHUB_URL } from '@/lib/founder';

export const metadata = buildSeoMetadata({
  title: 'المركز الإعلامي والهوية المؤسسية',
  description: 'حقائق أساسية وروابط موثوقة عن منصة روافد ومؤسسها خالد الذيب — Khaled altheeb، للاستخدام الإعلامي والبحثي والتعريفي.',
  path: '/press',
  index: true,
  follow: true,
  keywords: ['منصة روافد', 'Rawafid', 'خالد الذيب', 'Khaled altheeb', 'المركز الإعلامي', 'الهوية المؤسسية'],
});

const facts = [
  ['الاسم الرسمي', 'منصة روافد — Rawafid'],
  ['المؤسس', FOUNDER_DISPLAY_NAME],
  ['الموقع الرسمي', SITE_URL],
  ['اللغة الأساسية', 'العربية'],
  ['النطاق', 'معرفة صحية ونفسية وتربوية وخدمية منظمة، مع مسارات للأدلة والمختصين والمراكز والموارد العملية.'],
];

export default function PressPage() {
  return (
    <>
      <SiteHeader />
      <main className="trust-page-shell">
        <nav className="breadcrumbs" aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">المركز الإعلامي</span>
        </nav>

        <section className="content-hero" style={{ maxWidth: '1000px', margin: '0 auto 2rem' }}>
          <span className="eyebrow">المركز الإعلامي والهوية المؤسسية</span>
          <h1>حقائق موثقة عن {BRAND_NAME}</h1>
          <p>
            هذه الصفحة مرجع تعريفي رسمي للصحفيين والباحثين والجهات المهنية التي تحتاج إلى بيانات أساسية ثابتة عن المنصة،
            مع فصل واضح بين المعلومات الصادرة عن روافد وبين التغطية المستقلة الصادرة عن جهات خارجية.
          </p>
        </section>

        <section className="content-shell" style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="content-card">
            <h2>بطاقة تعريف سريعة</h2>
            <dl style={{ display: 'grid', gap: '1rem', margin: 0 }}>
              {facts.map(([label, value]) => (
                <div key={label} style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 220px) 1fr', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(7,95,97,.12)' }}>
                  <dt style={{ fontWeight: 800 }}>{label}</dt>
                  <dd style={{ margin: 0 }}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="content-card" id="founder">
            <h2>المؤسس</h2>
            <p><strong>{FOUNDER_DISPLAY_NAME}</strong> هو مؤسس منصة روافد.</p>
            <p>
              للاستخدام المتسق في الفهارس ومحركات البحث والمراجع، تعتمد المنصة الصيغتين الرسميتين للاسم: «خالد الذيب» بالعربية و«Khaled altheeb» بالإنجليزية.
            </p>
            <p><a href={FOUNDER_GITHUB_URL} rel="me">الحساب الرسمي على GitHub</a></p>
          </div>

          <div className="content-card">
            <h2>ما هي روافد؟</h2>
            <p>
              روافد منصة عربية معرفية تنظّم المعرفة الصحية والنفسية والتربوية والخدمية ضمن مسارات واضحة، وتربط المحتوى بالمصادر والأدلة العملية والموارد والخدمات المهنية ذات الصلة.
            </p>
            <p>
              لا يُفهم الاستشهاد بجامعة أو منظمة أو إرشاد علمي داخل المنصة بوصفه شراكة أو اعتمادًا أو تأييدًا ما لم تعلن روافد ذلك صراحة وبصورة موثقة.
            </p>
          </div>

          <div className="content-card">
            <h2>روابط مرجعية</h2>
            <ul>
              <li><Link href="/about">من نحن ورسالة المنصة</Link></li>
              <li><Link href="/sources">منهج المصادر والمراجع</Link></li>
              <li><Link href="/editorial-policy">السياسة التحريرية</Link></li>
              <li><Link href="/medical-review-policy">سياسة المراجعة العلمية والطبية</Link></li>
              <li><Link href="/citation">كيفية الاستشهاد بمنصة روافد</Link></li>
              <li><Link href="/open-source/arabic-rtl-a11y-toolkit">مشروع روافد المفتوح للعربية وRTL</Link></li>
            </ul>
          </div>

          <div className="content-card">
            <h2>إرشاد للاستخدام الإعلامي</h2>
            <p>
              عند التعريف بالمنصة، يُفضّل استخدام الاسم «منصة روافد — Rawafid» وذكر المؤسس بصيغة «خالد الذيب — Khaled altheeb».
              ويجب تمييز المعلومات الرسمية الصادرة عن المنصة عن أي تقييم أو تغطية صحفية أو بحثية مستقلة.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
