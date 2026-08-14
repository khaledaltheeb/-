import type { Metadata } from 'next';
import Link from 'next/link';
import CognitiveLabBrowser from '@/components/cognitive-lab-browser';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';
import { cognitiveToolCategories, cognitiveTools } from '@/lib/cognitive-lab/catalog';
import { breadcrumbJsonLd, buildSeoMetadata } from '@/lib/seo';

export const metadata: Metadata = buildSeoMetadata({
  title: 'مختبر القدرات والأنشطة المعرفية',
  description: '53 نشاطًا عربيًا للانتباه والذاكرة والاستدلال والمرونة، بخصوصية محلية ونتائج وصفية من دون تشخيص أو مقارنة معيارية.',
  path: '/cognitive-lab',
  index: true,
  follow: true,
});

const facts = [
  { value: '53', label: 'نشاطًا أعيد بناؤه بمحرك روافد المستقل' },
  { value: '14', label: 'نشاطًا اجتاز عقد التدرج الدلالي من خمس درجات' },
  { value: '0', label: 'إجابات تُرسل إلى الخادم أو Supabase' },
  { value: '10', label: 'محاولات في الجلسة الواحدة لتقليل الإرهاق' },
];

export default function CognitiveLabPage() {
  const breadcrumbSchema = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'مختبر القدرات والأنشطة المعرفية', path: '/cognitive-lab' },
  ]);

  return (
    <>
      <SiteHeader />
      <main className="cognitive-lab-page">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }} />

        <section className="cognitive-hero">
          <div className="cognitive-shell cognitive-hero__grid">
            <div className="cognitive-hero__copy">
              <nav className="cognitive-breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span>مختبر القدرات</span></nav>
              <span className="cognitive-kicker">تعلم ذاتي · خصوصية بالتصميم</span>
              <h1>أنشطة معرفية واضحة، تعمل فعلًا، ولا تدّعي قياس ما لا تقيسه</h1>
              <p>مختبر عربي مستقل للانتباه والذاكرة والاستدلال والمرونة. يعرض الدقة والزمن الوسيط والمقارنة الذاتية فقط؛ لا درجة ذكاء، ولا تشخيص، ولا ترتيب بين المستخدمين.</p>
              <div className="cognitive-hero__actions">
                <a className="cognitive-primary-link" href="#cognitive-directory-title">استعراض الأنشطة</a>
                <a href="#cognitive-method">كيف بنينا المختبر؟</a>
              </div>
            </div>
            <aside className="cognitive-hero__panel" aria-label="مبادئ المختبر">
              <span>عقد الثقة</span>
              <h2>النتيجة لك، وتبقى على جهازك</h2>
              <ul>
                <li><strong>نتائج وصفية:</strong> عدد صحيح، دقة، وزمن وسيط.</li>
                <li><strong>انتقال بقرارك:</strong> لا سؤال يتقدم تلقائيًا بعد الإجابة.</li>
                <li><strong>إتاحة عملية:</strong> أزرار أصلية، لوحة مفاتيح، قارئ شاشة، وبديل نصي للصوت.</li>
                <li><strong>حفظ محلي:</strong> سجل اختياري يمكن مسحه من الجهاز نفسه.</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="cognitive-shell cognitive-quick-facts" aria-labelledby="quick-facts-title">
          <div className="cognitive-section-heading cognitive-section-heading--compact">
            <div><span>المعلومة السريعة</span><h2 id="quick-facts-title">ما الذي يميز هذا الإصدار؟</h2></div>
            <p>مرّر أفقيًا لقراءة البطاقات</p>
          </div>
          <div className="cognitive-fact-track" role="list" aria-label="معلومات سريعة قابلة للتمرير الأفقي">
            {facts.map((fact) => <article role="listitem" key={fact.label}><strong>{fact.value}</strong><p>{fact.label}</p></article>)}
          </div>
        </section>

        <div className="cognitive-shell">
          <CognitiveLabBrowser tools={cognitiveTools} categories={cognitiveToolCategories} />
        </div>

        <section className="cognitive-method" id="cognitive-method">
          <div className="cognitive-shell">
            <div className="cognitive-section-heading">
              <div><span>منهج التنفيذ</span><h2>فصلنا سلامة الإجابة عن ادعاء القياس</h2></div>
              <p>نجاح البرمجية لا يجعل النشاط مقياسًا سريريًا أو اختبارًا معياريًا.</p>
            </div>
            <div className="cognitive-method-grid">
              <article><span>01</span><h3>مفتاح إجابة واحد</h3><p>يولد المحرك كل محاولة مع إجابة واحدة موجودة مرة واحدة بين بدائل غير مكررة، ثم يختبر قبولها ورفض كل بديل خاطئ آليًا.</p></article>
              <article><span>02</span><h3>بنوك قابلة للفحص</h3><p>تتغير الأرقام والأسماء والرموز والسياقات بقواعد حتمية قابلة لإعادة الاختبار، بدل مجموعة أسئلة قصيرة تتكرر سريعًا.</p></article>
              <article><span>03</span><h3>تدرج مثبت أو معلن</h3><p>الأدوات الأربع عشرة ذات التدرج المختبر تحمل شارة واضحة. بقية الأدوات تعمل، لكن مستوياتها تبقى موسومة بأنها تحت المراجعة البشرية.</p></article>
              <article><span>04</span><h3>خصوصية بلا حساب</h3><p>تشغيل النشاط لا يحتاج تسجيل دخول. الإجابات لا تعبر الشبكة، والسجل إن حُفظ يبقى في التخزين المحلي ويمكن حذفه بزر واحد.</p></article>
            </div>
          </div>
        </section>

        <section className="cognitive-shell cognitive-boundary" aria-labelledby="cognitive-boundary-title">
          <div>
            <span>حدود مسؤولة</span>
            <h2 id="cognitive-boundary-title">المقاييس الصحية منفصلة عن الألعاب المعرفية</h2>
          </div>
          <p>لم نضع WHO-5 أو PHQ-9 أو GAD-7 أو AUDIT داخل هذا المختبر. كل مقياس صحي يحتاج مصدر الإصدار، والترخيص، والترجمة الموثقة، وطريقة الحساب، وسؤال الأثر عند وجوده، ومراجعة بشرية قبل إتاحته. هذه البوابة تمنع ظهور نتيجة تبدو دقيقة وهي مبنية على نموذج ناقص.</p>
          <a href="/medical-review-policy">قراءة منهجية المراجعة العلمية</a>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
