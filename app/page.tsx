import type { CSSProperties } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const fallbackPillars = [
  { slug: 'knowledge', name_ar: 'المعرفة', description: 'موسوعة وأدلة ومقارنات مبنية على بنية محتوى قابلة للتوسع.', accent: '#0f8f88' },
  { slug: 'mental-health', name_ar: 'الصحة النفسية', description: 'مسارات واضحة للفرد والأسرة والمعلم والمختص.', accent: '#8d7bd8' },
  { slug: 'addiction-recovery', name_ar: 'الإدمان والتعافي', description: 'معلومات ومسارات مساعدة ودعم وفق احتياج المستخدم.', accent: '#ff7d63' },
  { slug: 'inclusion-empowerment', name_ar: 'الدمج والتمكين', description: 'محتوى وخدمات للأشخاص ذوي الاحتياجات الخاصة ومقدمي الدعم.', accent: '#65ad69' },
  { slug: 'specialists-centers', name_ar: 'المختصون والمراكز', description: 'دليل موثق قابل للبحث والحجز والتواصل.', accent: '#4d8fd8' },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: sectors } = await supabase
    .from('sectors')
    .select('slug,name_ar,description,accent,sort_order')
    .eq('is_active', true)
    .order('sort_order')
    .order('name_ar')
    .limit(12);

  const pillars = sectors?.length ? sectors : fallbackPillars;

  return (
    <main className="site-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="منصة روافد الرئيسية">
          <span className="brand-mark">ر</span>
          <span><strong>روافد</strong><small>Rawafid</small></span>
        </Link>
        <nav aria-label="التنقل الرئيسي">
          <a href="#discover">اكتشف</a><a href="#sectors">القطاعات</a><a href="#specialists">المختصون والمراكز</a><Link href="/search">البحث</Link>
        </nav>
        <Link className="button ghost" href="/login">تسجيل الدخول</Link>
      </header>

      <section className="hero" id="discover">
        <div className="hero-copy">
          <span className="eyebrow">Rawafid Institutional Platform — V3</span>
          <h1>كيف يمكن لروافد مساعدتك اليوم؟</h1>
          <p>نظام مؤسسي جديد يُبنى من الصفر. هذه النسخة لا تحتوي أي محتوى مرحّل من الموقع القديم حتى تكتمل البنية والاختبارات.</p>
          <form className="search" action="/search" method="get" role="search">
            <input name="q" aria-label="البحث" minLength={2} maxLength={160} autoComplete="off" placeholder="ابحث عن حالة، مصطلح، مختص، مركز، أداة أو سؤال..." />
            <button type="submit">بحث</button>
          </form>
          <div className="intent-grid">
            {['أفهم حالة','أساعد شخصًا','أجد مختصًا','أجد مركزًا','أتعامل مع إدمان','أساعد طفلي','أستخدم أداة','أتعلم كمتخصص'].map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
        <div className="hero-panel" aria-label="حالة بناء المنصة">
          <span className="status-dot" />
          <strong>مرحلة التأسيس</strong>
          <p>الواجهة والبيانات والصلاحيات والـCMS قيد البناء والاختبار قبل إدخال المحتوى.</p>
          <ul><li>RTL وهوية بصرية موحدة</li><li>Supabase + RLS</li><li>SEO وPWA من الأساس</li><li>لوحات مدير ومختص مستقلة</li></ul>
        </div>
      </section>

      <section className="section" id="sectors">
        <div className="section-heading"><span>Dynamic Taxonomy</span><h2>القطاعات الأساسية</h2><p>القطاعات النشطة تُقرأ مباشرة من Supabase وتُرتب من لوحة الإدارة.</p></div>
        <div className="pillar-grid">
          {pillars.map((pillar) => {
            const style = { '--accent': pillar.accent || '#0f8f88' } as CSSProperties;
            return (
              <Link className="pillar dynamic-pillar" style={style} href={`/sectors/${pillar.slug}`} key={pillar.slug}>
                <div className="icon-dot" />
                <h3>{pillar.name_ar}</h3>
                <p>{pillar.description || 'قطاع معرفي وخدمي ضمن منصة روافد.'}</p>
                <span>استكشف القطاع</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section split" id="specialists">
        <div><span className="eyebrow">Directory & Portal</span><h2>مختصون ومراكز بصلاحيات حقيقية</h2><p>توثيق، مؤهلات، وسائل تواصل، موقع جغرافي، مواعيد، محتوى، مراجعات ورسائل — مع تحكم المدير في الصلاحيات.</p></div>
        <div className="feature-list"><span>Verification</span><span>Messaging</span><span>Appointments</span><span>Maps</span><span>Audit Trail</span><span>Role Based Access</span></div>
      </section>

      <footer><strong>منصة روافد</strong><span>الثيم الجديد فقط — لا يوجد محتوى قديم في هذه المرحلة.</span></footer>
    </main>
  );
}
