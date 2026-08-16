import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { getCommunityFeed, getCommunityRooms } from '@/lib/community';
import { buildSeoMetadata } from '@/lib/seo';
import styles from './experiences.module.css';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const dynamic = 'force-dynamic';
export const metadata: Metadata = buildSeoMetadata({
  title: 'شاركنا تجربتك | مجتمع روافد المعرفي',
  description: 'مساحة عربية لتبادل تجارب الأهل ومقدمي الخدمة والأسئلة والنصائح والاحتياطات في التربية الدامجة والدعم والخدمات.',
  path: '/experiences/',
  index: false,
  follow: true,
  type: 'website',
  keywords: ['تجارب الأهل', 'التربية الدامجة', 'ذوي الإعاقة', 'مقدمو الخدمة', 'مجتمع روافد'],
});

export default async function ExperiencesPage({ searchParams }: { searchParams: SearchParams }) {
  const [rooms, posts, query] = await Promise.all([
    getCommunityRooms(),
    getCommunityFeed(),
    searchParams,
  ]);

  return (
    <>
      <SiteHeader />
      <main className={styles.page}>
        {query.submitted === 'review' ? (
          <p className="system-message success" role="status">
            استلمنا تجربتك وأُرسلت للمراجعة قبل ظهورها للعامة.
          </p>
        ) : null}
        <section className={styles.hero}>
          <span className="eyebrow">مجتمع روافد المعرفي</span>
          <h1>شاركنا تجربتك</h1>
          <p>ما تعلّمته في موقف واحد قد يختصر على أسرة أخرى أسابيع من الحيرة. شارك ما حدث، وما نجح وما لم ينجح، مع حماية الخصوصية والتمييز بين الخبرة الشخصية والمعلومة المهنية.</p>
          <div className={styles.actions}>
            <Link prefetch={false} className={styles.primary} href="/experiences/new/">اكتب تجربتك</Link>
            <Link prefetch={false} className={styles.secondary} href="/login?next=/experiences/">تسجيل الدخول</Link>
          </div>
        </section>
        <section className={styles.principles}>
          <article><strong>تجربة لا تشخيص</strong><span>نشارك ما حدث معنا دون تحويل التجربة إلى وصفة عامة.</span></article>
          <article><strong>خصوصية أولاً</strong><span>لا أسماء أطفال ولا سجلات أو أرقام أو بيانات تكشف الهوية.</span></article>
          <article><strong>الفائدة قبل الشهرة</strong><span>التفاعل يقيس مدى فائدة الخبرة للآخرين، لا الشعبية.</span></article>
        </section>
        <section>
          <div className={styles.sectionHead}>
            <span className="eyebrow">غرف المعرفة</span>
            <h2>اختر المساحة الأقرب لتجربتك</h2>
          </div>
          <div className={styles.rooms}>
            {rooms.map((room) => (
              <article className={styles.room} key={room.id}>
                <span>{room.category}</span>
                <h3>{room.title}</h3>
                <p>{room.description}</p>
                <Link prefetch={false} href={`/experiences/rooms/${room.slug}/`}>دخول الغرفة</Link>
              </article>
            ))}
          </div>
        </section>
        <section>
          <div className={styles.sectionHead}>
            <span className="eyebrow">أحدث المشاركات</span>
            <h2>خبرات من المجتمع</h2>
          </div>
          {posts.length ? (
            <div className={styles.feed}>
              {posts.map((post) => (
                <article className={styles.post} key={post.id}>
                  <div>{post.post_type === 'experience' ? 'تجربة' : post.post_type === 'question' ? 'سؤال' : post.post_type === 'tip' ? 'نصيحة' : 'مشاركة'}</div>
                  <h3><Link prefetch={false} href={`/experiences/${post.slug}/`}>{post.title}</Link></h3>
                  <p>{post.summary}</p>
                  <footer><span>{post.useful_count} مفيدة</span><span>{post.comments_count} تعليق</span></footer>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <h3>المجتمع جاهز لأول تجربة</h3>
              <p>تم تجهيز الغرف وقواعد النشر، وستكون المشاركات الأولى أساس المعرفة المجتمعية.</p>
              <Link prefetch={false} href="/experiences/new/">كن من أوائل المشاركين</Link>
            </div>
          )}
        </section>
        <aside className={styles.safety}>
          <h2>قبل أن ترسل</h2>
          <p>احذف أي اسم كامل أو رقم هاتف أو عنوان أو اسم مدرسة أو مركز إذا كان ذكره يكشف هوية طفل أو شخص آخر. التجارب لا تستبدل التقييم أو الرعاية المهنية، ويمكن الإبلاغ عن المحتوى الذي يخرق الخصوصية أو يقدم ادعاءات مضللة.</p>
        </aside>
      </main>
      <SiteFooter />
    </>
  );
}
