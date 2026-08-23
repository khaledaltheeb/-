import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import TermQuiz from '@/components/term-quiz';
import { getTerminologyToolTerms } from '@/lib/terminology-tools';
import { buildSeoMetadata } from '@/lib/seo';
import styles from '../tools.module.css';

export const dynamic = 'force-dynamic';
export const metadata = buildSeoMetadata({
  title: 'اختبار مصطلحات علم النفس',
  description: 'اختبار تعليمي عربي يطابق تعريفات المصطلحات النفسية المنشورة بأسمائها لتثبيت المعرفة دون تشخيص أو قياس للذكاء أو تخزين للإجابات.',
  path: '/tools/quiz',
  index: true,
  follow: true,
  keywords: ['اختبار مصطلحات علم النفس', 'مصطلحات نفسية', 'تعلم علم النفس', 'روافد'],
});

export default async function QuizPage() {
  const terms = await getTerminologyToolTerms();
  return <><SiteHeader/><main className={styles.page}><section className={styles.hero}><div className={styles.shell}><span className={styles.eyebrow}>تعلم لا تقييم نفسي</span><h1>اختبار المصطلحات</h1><p>اقرأ الوصف المنشور واختر المصطلح الأقرب. النتيجة تخص هذه الجلسة فقط ولا تُرسل إلى الخادم ولا تُستخدم لتقييم قدراتك.</p></div></section><section className={`${styles.shell} ${styles.section}`}><TermQuiz terms={terms}/></section></main><SiteFooter/></>;
}
