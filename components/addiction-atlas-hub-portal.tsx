import Link from 'next/link';
import { getAddictionAtlas } from '@/lib/addiction-atlas';
import styles from './addiction-atlas.module.css';

export default async function AddictionAtlasHubPortal() {
  const atlas = await getAddictionAtlas();
  const comparisons = atlas.comparisons.filter((item) => item.indexable);
  const reviewedEvidence = atlas.substances.filter((item) => item.evidence_grade !== 'U').length;
  const pathways = [
    { href: '/addiction/substances/', title: 'أطلس المواد التفاعلي', text: 'ابحث وصفِّ وقارن بين المواد والعائلات عبر ثمانية محاور مستقلة، مع الوصول إلى الملف العلمي لكل مادة.' },
    { href: '/addiction/compare/', title: 'المقارنات التفاعلية والتحريرية', text: 'اختر مادتين للمقارنة الفورية، وافتح المقارنة التحريرية عندما تكون مراجعة ومتاحة لهذا الزوج.' },
    { href: '/addiction/interactions/', title: 'التفاعلات المراجعة', text: 'افحص الأزواج التي توجد لها مراجعة علمية. عدم وجود زوج في السجل لا يعني أنه آمن.' },
    { href: '/addiction/prevalence/', title: 'الانتشار والوبائيات', text: 'مؤشرات رصد سكاني مرتبطة بالسنة والجغرافيا وتعريف القياس والمصدر.' },
    { href: '/addiction/mortality/', title: 'الوفيات والجرعات الزائدة', text: 'بيانات وفيات منفصلة عن مقياس المخاطر، مع حالة البيانات ونطاقها الجغرافي.' },
    { href: '/addiction/methodology/', title: 'المنهجية وقوة الدليل', text: 'كيف تُبنى المحاور، وكيف يظهر عدم اليقين، وما الذي نرفض استنتاجه عندما لا يكفي الدليل.' },
  ];

  return <section className={styles.section} aria-labelledby="interactive-addiction-atlas-title">
    <div className={styles.card}>
      <span className={styles.eyebrow}>موسوعة روافد التفاعلية · تمت المراجعة من قبل فريق روافد</span>
      <h2 id="interactive-addiction-atlas-title">الأطلس العربي التفاعلي للإدمان والمواد</h2>
      <p>طبقة معرفية منظمة فوق محتوى القطاع: {atlas.substances.length} مادة أو عائلة، {comparisons.length} مقارنة تحريرية، تفاعلات تمت مراجعتها، وبيانات وبائية ووفيات مرتبطة بمصادرها. لا تختزل المخاطر في رقم واحد ولا تستنتج الأمان من نقص البيانات.</p>
      <div className={styles.actions}><Link href="/addiction/substances/">فتح الأطلس التفاعلي</Link><Link href="/addiction/compare/">قارن مادتين</Link><Link href="/addiction/interactions/">التفاعلات</Link><Link href="/addiction/methodology/">المنهجية</Link></div>
    </div>

    <div className={styles.statsSummary} aria-label="نطاق الأطلس التفاعلي">
      <article><strong>{atlas.substances.length}</strong><span>مادة/عائلة</span></article>
      <article><strong>{comparisons.length}</strong><span>مقارنة تحريرية</span></article>
      <article><strong>{atlas.interactions.length}</strong><span>تفاعلًا مراجعًا</span></article>
      <article><strong>{reviewedEvidence}</strong><span>سجلًا بدليل مصنف</span></article>
    </div>

    <div className={styles.grid}>
      {pathways.map((item) => <article className={styles.card} key={item.href}><h3><Link href={item.href}>{item.title}</Link></h3><p>{item.text}</p><Link href={item.href}>فتح المسار ←</Link></article>)}
    </div>

    <div className={styles.notice}><strong>قاعدة سلامة ثابتة</strong><p>الأطلس لا يقدم جرعات استخدام أو طرق تحضير أو وصفات خلط أو خطة انسحاب ذاتية. علامات الطوارئ مثل عدم الاستجابة، بطء أو توقف التنفس، الاختلاج، ألم الصدر أو الارتباك الحاد تستلزم خدمات الطوارئ المحلية.</p></div>
  </section>;
}
