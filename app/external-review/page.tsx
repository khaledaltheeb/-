import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';
import { externalReviewPrinciples, externalReviewTracks } from '@/lib/external-review-program';
import styles from '@/components/evidence-guides.module.css';

export const metadata:Metadata=buildSeoMetadata({
 title:'برنامج المراجعة الخارجية في روافد: النطاق والحالة ومنع ادعاءات الاعتماد',
 description:'سجل شفاف لمسارات المراجعة الخارجية واختبار المستخدمين في روافد، يوضح ما هو جاهز للمراجعة وما لم تتم مراجعته بعد، دون ادعاء شراكة أو اعتماد.',
 path:'/external-review/',index:true,follow:true,type:'website',
 keywords:['المراجعة الخارجية','المراجعة العلمية','حوكمة المحتوى','روافد','مراجعة الإدمان','الأمراض النادرة','الوصولية']
});

export default function ExternalReviewPage(){
 const schema={'@context':'https://schema.org','@type':'CollectionPage','@id':`${SITE_URL}/external-review/#page`,url:`${SITE_URL}/external-review/`,name:'برنامج المراجعة الخارجية في روافد',description:'سجل شفاف لنطاقات المراجعة الخارجية وحالتها الفعلية.',inLanguage:'ar',isPartOf:{'@id':`${SITE_URL}/#website`},publisher:{'@id':`${SITE_URL}/#organization`}};
 return <><SiteHeader/><main className={styles.shell}>
  <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>
  <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><span aria-current="page">المراجعة الخارجية</span></nav>
  <section className={styles.hero}>
   <span className="eyebrow">حوكمة علمية قابلة للتدقيق</span>
   <h1>برنامج المراجعة الخارجية</h1>
   <p>نفرّق علنًا بين محتوى أعده فريق روافد، وحزمة جاهزة لإرسالها إلى خبير، ومراجعة خارجية حدثت فعلًا. اسم جهة مرجعية في هذه الصفحة لا يعني شراكة أو اعتمادًا.</p>
   <div className={styles.stats}><strong>{externalReviewTracks.length}</strong><span>مسارات محددة النطاق · لا ادعاءات مراجعة غير موثقة</span></div>
   <nav className={styles.localNav} aria-label="روابط مرتبطة بالمراجعة"><Link href="/medical-review-policy">سياسة المراجعة العلمية</Link><Link href="/editorial-policy">السياسة التحريرية</Link><Link href="/evidence-guides/">الأدلة المبنية على المصادر</Link><Link href="/trust/">الثقة والمنهجية</Link></nav>
  </section>
  <section className={styles.guideIntro} aria-labelledby="review-principles"><span className="eyebrow">قواعد ملزمة</span><h2 id="review-principles">ما الذي يمنع تضخيم صفة «المراجعة»؟</h2><ul>{externalReviewPrinciples.map((item)=><li key={item}>{item}</li>)}</ul></section>
  {externalReviewTracks.map((track)=><section className={styles.group} key={track.id} aria-labelledby={`track-${track.id}`}>
   <div className={styles.groupHead}><div><span className="eyebrow">{track.status==='package-ready'?'حزمة مراجعة جاهزة':'اختبار مستخدمين مخطط'}</span><h2 id={`track-${track.id}`}>{track.title}</h2></div><span>{track.target}</span></div>
   <div className={styles.grid}>
    <article className={styles.card}><h3>النطاق</h3><p>{track.scope}</p><p><strong>الحالة العلنية:</strong> {track.publicNote}</p></article>
    <article className={styles.card}><h3>أسئلة المراجع/المستخدم</h3><ol>{track.questions.map((q)=><li key={q}>{q}</li>)}</ol></article>
    <article className={styles.card}><h3>المواد الداخلة في الجولة</h3><ul>{track.evidencePaths.map((path)=><li key={path}><Link href={path}>{path}</Link></li>)}</ul></article>
   </div>
  </section>)}
  <section className={styles.guideIntro}><span className="eyebrow">بعد وصول مراجعة فعلية</span><h2>متى تتغير صفة الصفحة؟</h2><p>لا نملأ اسم المراجع أو تاريخ المراجعة لمجرد إرسال طلب. عند وصول مراجعة بشرية موثقة نربطها بالنسخة التي رآها المراجع، نسجل النطاق والتعارضات المحتملة والتغييرات الناتجة عنها، ثم فقط نحدّث حقول المراجعة في الصفحة ذات الصلة. إذا كانت المراجعة جزئية، تظهر على أنها جزئية.</p></section>
 </main><SiteFooter/></>;
}
