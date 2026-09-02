import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import WorldreaderAfrcTrackedLink from '@/components/worldreader-afrc-tracked-link';
import { buildSeoMetadata } from '@/lib/seo';
import styles from './worldreader-afrc.module.css';

const PARTNER_LINK = 'https://urlgeni.us/a79eb';
const WORLDREADER_AR_PAGE = 'https://www.worldreader.org/all-families-reading-challenge-2026-arabic/';
const WORLDREADER_PRESS = 'https://www.worldreader.org/now/worldreader-brings-families-around-the-world-together-for-first-ever-all-families-reading-challenge/';

export const metadata = buildSeoMetadata({
  title: 'تحدي القراءة لجميع الأسر 2026 | Worldreader وBookSmart',
  description:
    'صفحة تعريف عربية لتحدي القراءة لجميع الأسر 2026 من Worldreader، مع الوصول إلى BookSmart والمعلومات الرسمية للمشاركة خلال سبتمبر 2026.',
  path: '/campaigns/all-families-reading-challenge-2026',
  index: true,
  follow: true,
  keywords: [
    'تحدي القراءة لجميع الأسر 2026',
    'Worldreader',
    'BookSmart',
    'Vroom',
    'القراءة مع الأطفال',
    'القراءة الأسرية',
  ],
});

const facts = [
  {
    title: 'الحملة خلال سبتمبر 2026',
    text: 'Worldreader تنظم التحدي طوال شهر سبتمبر، وتدعو الأسر إلى بناء روتين قراءة مشترك عبر BookSmart.',
  },
  {
    title: 'نركز على عمر 3–5 سنوات',
    text: 'بناءً على التوجيه المباشر الذي تلقته روافد من Worldreader، نركز في الترويج على الأسر التي لديها أطفال بعمر 3–5 سنوات، وهي الفئة المستهدفة بصورة خاصة بالكتب العشرة المختارة للتحدي.',
  },
  {
    title: 'BookSmart أوسع من التحدي',
    text: 'تطبيق BookSmart نفسه يخدم الأسر التي لديها أطفال حتى عمر 8 سنوات، لذلك قد تجد الأسرة موارد أوسع من الكتب المختارة للتحدي.',
  },
];

export default function AllFamiliesReadingChallenge2026Page() {
  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="afrc-title">
          <div className={styles.shell}>
            <nav className={styles.breadcrumbs} aria-label="مسار الصفحة">
              <Link href="/">الرئيسية</Link><span>/</span><Link href="/sectors/child-family-education">الطفل والأسرة والمدرسة</Link><span>/</span><span>تحدي القراءة 2026</span>
            </nav>

            <div className={styles.grid}>
              <div>
                <span className={styles.kicker}>Worldreader · BookSmart · سبتمبر 2026</span>
                <h1 id="afrc-title">تحدي القراءة لجميع الأسر 2026</h1>
                <p className={styles.lead}>
                  تدعو Worldreader الأسر إلى القراءة مع الأطفال خلال شهر سبتمبر عبر تطبيق BookSmart المجاني. تنشر روافد هذه الصفحة لتسهيل وصول الأسر العربية إلى الحملة الرسمية، مع إبقاء Worldreader وBookSmart المصدر المرجعي للمشاركة والمحتوى والأنشطة.
                </p>
                <div className={styles.actions}>
                  <WorldreaderAfrcTrackedLink href={PARTNER_LINK} placement="hero" destination="campaign" className={styles.primaryButton}>
                    الانضمام إلى التحدي عبر الرابط الرسمي
                  </WorldreaderAfrcTrackedLink>
                  <WorldreaderAfrcTrackedLink href={WORLDREADER_AR_PAGE} placement="official_page" destination="worldreader" className={styles.secondaryButton}>
                    فتح صفحة Worldreader العربية
                  </WorldreaderAfrcTrackedLink>
                </div>
                <p className={styles.small}>
                  الرابط الأول هو رابط الحملة الذي طلبت Worldreader من روافد استخدامه لقياس الوصول من شبكتنا.
                </p>
              </div>

              <aside className={styles.card} aria-label="ما الذي يهم الأسرة الآن؟">
                <h2>ما الذي يهم الأسرة الآن؟</h2>
                <ul>
                  <li>اختيار وقت قصير وثابت للقراءة مع الطفل.</li>
                  <li>استخدام BookSmart للوصول إلى الكتب والأنشطة الرسمية.</li>
                  <li>إكمال الكتب والأنشطة وفق تعليمات Worldreader داخل الحملة.</li>
                  <li>الرجوع إلى Worldreader عند اختلاف أي معلومة أو تحديث للحملة.</li>
                </ul>
              </aside>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="facts-title">
          <div className={styles.shell}>
            <span className={styles.eyebrow}>المعلومات الأساسية</span>
            <h2 id="facts-title">ما الذي أكّدته Worldreader لنا؟</h2>
            <div className={styles.factGrid}>
              {facts.map((fact) => (
                <article className={styles.fact} key={fact.title}>
                  <strong>{fact.title}</strong>
                  <p>{fact.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt} aria-labelledby="vroom-title">
          <div className={styles.shellNarrow}>
            <span className={styles.eyebrow}>كتب + لحظات بناء الدماغ</span>
            <h2 id="vroom-title">تتضمن الحملة أيضًا Vroom Tips باللغة العربية</h2>
            <p>
              أخبرتنا Worldreader أن BookSmart يتضمن نصائح Vroom باللغة العربية، وأن خمسًا منها مميزة خلال سبتمبر. لذلك لا تعيد روافد إنشاء هذه الأنشطة أو تقديم بديل عنها؛ نوجّه الأسر إلى BookSmart لاستخدام النسخة الرسمية ضمن تجربة التحدي.
            </p>
            <WorldreaderAfrcTrackedLink href={PARTNER_LINK} placement="vroom" destination="campaign" className={styles.primaryButton}>
              فتح الحملة وBookSmart
            </WorldreaderAfrcTrackedLink>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="boundary-title">
          <div className={styles.shellNarrow}>
            <span className={styles.eyebrow}>حدود العلاقة بوضوح</span>
            <h2 id="boundary-title">هذه صفحة دعم وصول، وليست مادة مشتركة أو معتمدة من Worldreader</h2>
            <p>
              سمحت Worldreader لروافد بالمساعدة في نشر التحدي بين الأسر العربية. روافد ليست في الوقت الحالي Family Engagement Champion، ولا راعيًا للحملة، ولا تستخدم شعار Worldreader أو أصولًا مشتركة على أنها شراكة رسمية. هذه الصفحة ليست منهجًا تابعًا لـWorldreader ولم تُقدَّم بوصفها مادة راجعتها أو اعتمدتها Worldreader.
            </p>
            <div className={styles.notice}>
              <strong>إذا اختلفت هذه الصفحة مع Worldreader أو BookSmart</strong>
              <p>تُقدَّم تعليمات Worldreader وBookSmart الرسمية، لأنها المصدر المباشر للحملة ومحتواها وشروط المشاركة.</p>
            </div>
          </div>
        </section>

        <section className={styles.sectionAlt} aria-labelledby="sources-title">
          <div className={styles.shellNarrow}>
            <span className={styles.eyebrow}>المصدر الرسمي</span>
            <h2 id="sources-title">تابع المعلومات من Worldreader مباشرة</h2>
            <p>
              أطلقت Worldreader الحملة في 2 سبتمبر 2026 ضمن فعالية عالمية، وتعرض صفحاتها الرسمية أحدث تفاصيل الحملة والتطبيق والمشاركة.
            </p>
            <div className={styles.sourceList}>
              <a className={styles.sourceLink} href={WORLDREADER_AR_PAGE} target="_blank" rel="noopener noreferrer">صفحة تحدي القراءة العربية لدى Worldreader</a>
              <a className={styles.sourceLink} href={WORLDREADER_PRESS} target="_blank" rel="noopener noreferrer">إعلان إطلاق All Families Reading Challenge — 2 سبتمبر 2026</a>
            </div>
          </div>
        </section>

        <section className={styles.footerCta} aria-labelledby="final-title">
          <div className={styles.shellNarrow}>
            <span className={styles.eyebrow}>شارك التحدي مع أسرة أخرى</span>
            <h2 id="final-title">ابدأ من المصدر الرسمي</h2>
            <p>استخدم رابط Worldreader المخصص لروافد للوصول إلى الحملة، ثم اتبع التعليمات والكتب والأنشطة داخل BookSmart.</p>
            <WorldreaderAfrcTrackedLink href={PARTNER_LINK} placement="footer_cta" destination="campaign" className={styles.primaryButton}>
              الانتقال إلى Worldreader / BookSmart
            </WorldreaderAfrcTrackedLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
