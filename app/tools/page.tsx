import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { getTerminologyToolTerms } from '@/lib/terminology-tools';
import { buildSeoMetadata } from '@/lib/seo';
import styles from './tools.module.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = buildSeoMetadata({ title: 'أدوات تعلم المصطلحات النفسية', description: 'أدوات تعليمية عربية تعتمد على المصطلحات المنشورة والمراجعة في روافد: مقارنة المفاهيم، مصطلح اليوم، اختبار تعليمي، ومحفوظات محلية.', path: '/tools', index: true, follow: true });

export default async function ToolsPage() {
  const terms = await getTerminologyToolTerms();
  const tools = [
    ['/tools/compare','مقارنة مصطلحين','اختر مفهومين منشورين واعرض تعريفهما المختصر وروابط صفحتيهما جنبًا إلى جنب.'],
    ['/tools/quiz','اختبار المصطلحات','اختبار تعليمي قصير يطابق التعريف بالمصطلح؛ لا يقيس الذكاء ولا الصحة النفسية.'],
    ['/tools/daily-term','مصطلح اليوم','اختيار يومي حتمي من المصطلحات المنشورة، مع رابط للمقال الموسوعي الكامل.'],
    ['/tools/favorites','المحفوظات','احفظ معرّفات المصطلحات التي تريد الرجوع إليها على هذا الجهاز فقط.'],
  ] as const;
  return <><SiteHeader/><main className={styles.page}><section className={styles.hero}><div className={styles.shell}><span className={styles.eyebrow}>المسار التاريخي منقول ومُعاد البناء</span><h1>أدوات تعلم المصطلحات النفسية</h1><p>كانت الأدوات القديمة تعتمد قائمة ثابتة. النسخة الجديدة تقرأ مباشرة من المحتوى المنشور بعد المراجعة، لذلك لا تعرض مصطلحًا لم يجتز دورة النشر. يوجد حاليًا <strong>{terms.length.toLocaleString('ar')}</strong> مصطلحًا متاحًا للأدوات.</p></div></section><section className={`${styles.shell} ${styles.section}`}><div className={styles.grid}>{tools.map(([href,title,description])=><Link className={styles.card} href={href} key={href}><h2>{title}</h2><p>{description}</p><span className={styles.link}>فتح الأداة</span></Link>)}</div><div className={styles.privacy}><strong>حدود الاستخدام:</strong> هذه أدوات تعلم وتنظيم معرفة، وليست اختبارات نفسية أو أدوات تشخيص. اختبار المصطلحات لا يخزن الإجابات، والمحفوظات تحفظ معرّفات المصطلحات محليًا في المتصفح فقط.</div></section></main><SiteFooter/></>;
}
