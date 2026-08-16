import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata } from '@/lib/seo';
import styles from './team-and-partners.module.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'فريق العمل والشركاء | دليل موثّق',
  description: 'صفحة الفريق والشراكات العلمية بعد نقل محتواها التاريخي إلى روافد الجديدة: التحقق، الموافقة، الخصوصية، حالة الملفات ومسارات الانضمام.',
  path: '/team-and-partners',
  index: false,
  follow: true,
});

const rules = [
  ['الموافقة قبل النشر','لا ننشر اسمًا أو دورًا مهنيًا أو ملفًا عامًا لشخص اعتمادًا على رسالة أو قائمة داخلية فقط؛ يلزم مسار موافقة واضح وقابل للتدقيق.'],
  ['دليل الهوية المهنية','يُربط الملف، حيث يلزم، بمصدر مهني قابل للتحقق مثل جهة العمل أو الجامعة أو سجل مهني أو معرّف بحثي مناسب. وجود اسم في الصفحة لا يغني عن التحقق.'],
  ['البيانات الخاصة','البريد ورقم الهاتف ووسائل الاتصال الخاصة تبقى حقول حساب خاصة ما لم يطلب صاحب الملف نشر وسيلة محددة صراحة. لا تُعرض وثائق الهوية في الملف العام.'],
  ['حالة التحقق','إذا لم تكتمل أدلة الدور أو المؤهل تبقى الحالة تحت المراجعة ولا تُقدَّم للقارئ كاعتماد مكتمل. الشراكات المؤسسية تحتاج نطاق تعاون واضحًا ومسؤوليات قابلة للفهم.'],
];

export default function TeamAndPartnersPage(){
  return <><SiteHeader/><main className={styles.page}>
    <section className={styles.hero}><div className={styles.shell}>
      <span className={styles.eyebrow}>محتوى تاريخي منقول ومطوّر</span>
      <h1>المختصون والشراكات العلمية</h1>
      <p>نُقلت هذه الصفحة نفسها إلى التطبيق الجديد بدل تحويلها إلى نموذج الانضمام. وظيفتها توضيح كيف تُعامل روافد ملفات المختصين والمراكز والشركاء: ما الذي يمكن نشره، وما الذي يبقى خاصًا، وما معنى أن يكون الملف تحت التحقق أو معتمدًا للنشر.</p>
    </div></section>
    <section className={`${styles.shell} ${styles.content}`}>
      <article className={styles.intro}><h2>دليل مهني لا قائمة أسماء غير موثقة</h2><p>الفكرة المفيدة في النسخة القديمة كانت الفصل بين «إضافة اسم» وبين «إنشاء ملف مهني موثّق». نحافظ على هذا الفصل في روافد الجديدة: الملف العام يحتاج بيانات مهنية قابلة للتحقق، بينما بيانات الحساب والاتصال الحساسة تُدار خارج الواجهة العامة.</p></article>
      <div className={styles.grid}>{rules.map(([title,body])=><article key={title} className={styles.card}><h2>{title}</h2><p>{body}</p></article>)}</div>
      <article className={styles.workflow}><h2>المسارات الحالية داخل المنصة</h2><div className={styles.links}><Link href="/specialists">دليل المختصين</Link><Link href="/centers">دليل المراكز</Link><Link href="/join/specialist">طلب انضمام مختص</Link><Link href="/join/center">طلب انضمام مركز</Link><Link href="/join">الشراكات والمسارات المهنية</Link></div><p>هذه روابط تنقل المستخدم باختياره إلى الوظيفة المناسبة؛ عنوان <code>/team-and-partners</code> نفسه لم يعد redirect ويحتفظ بالمحتوى والسياسة التي كانت موجودة في الموقع القديم.</p></article>
      <article className={styles.privacy}><h2>الخصوصية وتعارض المصالح</h2><p>لا ينبغي أن يحتوي الملف العام على وثائق هوية أو مراسلات خاصة أو معلومات اتصال لم يوافق صاحبها على نشرها. وعندما تكون هناك علاقة مؤسسية أو مصلحة قد تؤثر في عرض محتوى أو خدمة، يجب توضيحها بدل إخفائها داخل وصف تسويقي عام.</p></article>
    </section>
  </main><SiteFooter/></>;
}
