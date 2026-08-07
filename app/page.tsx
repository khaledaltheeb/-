import type { CSSProperties } from 'react';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { createClient } from '@/lib/supabase/server';
import { buildSeoMetadata } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata = buildSeoMetadata({
  title: 'الصحة النفسية والتعافي والتمكين',
  description: 'منصة روافد للصحة النفسية والتعافي والدمج والتمكين: معرفة موثوقة، أدلة عملية، دليل مختصين ومراكز، وخدمات مترابطة للأفراد والأسر ومقدمي الخدمة في الوطن العربي.',
  path: '/',
  index: true,
  keywords: ['الصحة النفسية', 'التعافي', 'الدمج', 'التمكين', 'مختص نفسي', 'مراكز نفسية', 'منصة روافد'],
});

const fallbackPillars = [
  { slug: 'knowledge', name_ar: 'المعرفة', description: 'موسوعة وأدلة ومقارنات مبنية على بنية محتوى قابلة للتوسع.', accent: '#08716d' },
  { slug: 'mental-health', name_ar: 'الصحة النفسية', description: 'مسارات واضحة للفرد والأسرة والمعلم والمختص.', accent: '#6753b5' },
  { slug: 'addiction-recovery', name_ar: 'الإدمان والتعافي', description: 'معلومات ومسارات مساعدة ودعم وفق احتياج المستخدم.', accent: '#bb4d3d' },
  { slug: 'inclusion-empowerment', name_ar: 'الدمج والتمكين', description: 'محتوى وخدمات للأشخاص ذوي الاحتياجات الخاصة ومقدمي الدعم.', accent: '#3d7d45' },
  { slug: 'specialists-centers', name_ar: 'المختصون والمراكز', description: 'دليل موثق قابل للبحث والحجز والتواصل.', accent: '#2f68a8' },
];

const intents = [
  ['أفهم حالة', 'حالة نفسية'], ['أساعد شخصًا', 'دعم الأسرة'], ['أجد مختصًا', 'مختص نفسي'], ['أجد مركزًا', 'مركز نفسي'],
  ['أتعامل مع إدمان', 'الإدمان والتعافي'], ['أساعد طفلي', 'الصحة النفسية للطفل'], ['أستخدم أداة', 'أداة تقييم'], ['أتعلم كمتخصص', 'دليل للمختص'],
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: sectors } = await supabase
    .from('sectors')
    .select('slug,name_ar,description,accent,sort_order')
    .eq('is_active', true)
    .eq('visibility', 'public')
    .order('sort_order')
    .order('name_ar')
    .limit(12);

  const pillars = sectors?.length ? sectors : fallbackPillars;

  return (
    <>
      <SiteHeader />
      <main className="site-shell">
        <section className="hero institutional-hero" id="discover">
          <div className="hero-copy">
            <span className="eyebrow">معرفة موثوقة · دليل مهني · خدمات مترابطة</span>
            <h1>مسارات أوضح للصحة النفسية والتعافي والتمكين</h1>
            <p>روافد تجمع المعرفة المتخصصة، الأدلة العملية، المختصين والمراكز ضمن تجربة عربية مؤسسية مصممة للفرد والأسرة ومقدم الخدمة.</p>
            <form className="search hero-search" action="/search" method="get" role="search">
              <label className="sr-only" htmlFor="home-search">البحث في روافد</label>
              <input id="home-search" name="q" type="search" minLength={2} maxLength={160} autoComplete="off" placeholder="ابحث عن حالة، عرض، مختص، مركز، أداة أو سؤال..." />
              <button type="submit">بحث في روافد</button>
            </form>
            <div className="intent-grid" aria-label="مسارات بحث سريعة">
              {intents.map(([label, query]) => <Link key={label} href={`/search?q=${encodeURIComponent(query)}`}>{label}</Link>)}
            </div>
          </div>
          <aside className="hero-panel hero-guidance" aria-label="ابدأ من المسار المناسب">
            <span className="hero-panel-kicker">ابدأ من احتياجك</span>
            <h2>لا تحتاج لمعرفة اسم التشخيص لتصل إلى المسار المناسب.</h2>
            <p>ابدأ بالسؤال أو العرض أو نوع الدعم الذي تبحث عنه، ثم انتقل إلى المعرفة أو الدليل المهني أو الخدمات ذات الصلة.</p>
            <div className="hero-panel-links">
              <Link href="/specialists">البحث عن مختص</Link>
              <Link href="/centers">البحث عن مركز</Link>
              <Link href="/community">المتدربون والمتطوعون</Link>
            </div>
          </aside>
        </section>

        <section className="trust-strip" aria-label="معايير الثقة">
          <div><strong>مراجعة منهجية</strong><span>سير عمل للمراجعة العلمية والتحريرية قبل النشر</span></div>
          <div><strong>توثيق مهني</strong><span>حالات تحقق واضحة للمختصين والمراكز</span></div>
          <div><strong>خصوصية بالتصميم</strong><span>إظهار بيانات التواصل حسب موافقة صاحب الملف</span></div>
          <div><strong>إتاحة وموبايل أولًا</strong><span>RTL وتباين وواجهات قابلة للاستخدام على الشاشات الصغيرة</span></div>
        </section>

        <section className="section" id="sectors">
          <div className="section-heading"><span>قطاعات مترابطة</span><h2>استكشف روافد حسب الموضوع</h2><p>البنية ديناميكية؛ القطاعات والأقسام النشطة تُدار من لوحة الإدارة وتظهر هنا دون تعديل الكود.</p></div>
          <div className="pillar-grid">
            {pillars.map((pillar) => {
              const style = { '--accent': pillar.accent || '#08716d' } as CSSProperties;
              return (
                <Link className="pillar dynamic-pillar" style={style} href={`/sectors/${pillar.slug}`} key={pillar.slug}>
                  <div className="icon-dot" aria-hidden="true" />
                  <h3>{pillar.name_ar}</h3>
                  <p>{pillar.description || 'قطاع معرفي وخدمي ضمن منصة روافد.'}</p>
                  <span>استكشف القطاع ←</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="section split directory-callout" id="specialists">
          <div><span className="eyebrow">دليل مهني موثق</span><h2>مختصون ومراكز ضمن دورة توثيق واضحة</h2><p>ملفات مهنية، تخصصات، مؤهلات، موقع جغرافي وإعدادات خصوصية، مع مراجعة واعتماد إداري قبل الظهور العام.</p><div className="section-actions"><Link className="primary-link" href="/specialists">دليل المختصين</Link><Link className="button" href="/centers">دليل المراكز</Link></div></div>
          <div className="feature-list"><span>Verification</span><span>Privacy Controls</span><span>Messaging</span><span>Appointments</span><span>Maps</span><span>Audit Trail</span></div>
        </section>

        <section className="section community-callout">
          <div><span className="eyebrow">المشاركة والتطوير المهني</span><h2>مساحة للمتدربين والمتطوعين</h2><p>قسم مستقل يميز بوضوح بين المختص المرخص، المتدرب، والمتطوع، مع إشراف واعتماد وحالة ظهور واضحة لكل ملف.</p></div>
          <Link className="primary-link" href="/community">استكشف القسم</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
