import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, breadcrumbJsonLd, SITE_URL } from '@/lib/seo';
import { kidsLabCategories, kidsLabSeries, KIDS_LAB_LEVELS, KIDS_LAB_TARGET_ITEMS } from '@/lib/capabilities/kids-lab-catalog';
import { attentionActivityCount } from '@/lib/capabilities/attention-lab';
import { memoryActivityCount } from '@/lib/capabilities/memory-lab';
import { executiveActivityCount } from '@/lib/capabilities/executive-functions-lab';
import { visualPerceptionActivityCount } from '@/lib/capabilities/visual-perception-lab';
import { visualMotorActivityCount } from '@/lib/capabilities/visual-motor-lab';
import { fineMotorActivityCount } from '@/lib/capabilities/fine-motor-lab';
import { bilateralActivities } from '@/lib/capabilities/bilateral-tracks';
import { bilateralLabActivityCount } from '@/lib/capabilities/bilateral-lab';
import { languageReadingActivityCount } from '@/lib/capabilities/language-reading-lab';
import { mathLogicActivityCount } from '@/lib/capabilities/math-logic-lab';
import { emotionalRegulationActivityCount } from '@/lib/capabilities/emotional-regulation-lab';
import { socialActivityCount } from '@/lib/capabilities/social-skills-lab';
import { sensorySelfActivityCount } from '@/lib/capabilities/sensory-self-regulation-lab';
import styles from './kids-lab.module.css';

export const metadata=buildSeoMetadata({
  title:'مختبر الأنشطة والاختبارات للأطفال | لنرتقي بقدراتهم',
  description:'مكتبة عربية منقحة تضم 1000 نشاط واختبار قابل للطباعة موزعة على 67 سلسلة مهارية وخمسة مستويات متدرجة، مع اختبارات إتقان غير تشخيصية.',
  path:'/capabilities/kids-lab/',
  index:true,
  keywords:['أنشطة أطفال قابلة للطباعة','أوراق عمل للأطفال','اختبارات مهارات للأطفال','الانتباه','الذاكرة','الوظائف التنفيذية','الإدراك البصري','التكامل البصري الحركي','المهارات الحركية الدقيقة','التآزر الثنائي','الوعي الصوتي','الاستعداد للقراءة','الرياضيات المبكرة','المنطق البصري','التنظيم الانفعالي','المهارات الاجتماعية','التنظيم الذاتي','الوعي الحسي']
});

const bilateralTotal=bilateralActivities.length+bilateralLabActivityCount;
const completedCards=[
  ['الانتباه والتركيز',attentionActivityCount,'8 سلاسل من الانتباه الانتقائي والمستمر إلى تبديل القاعدة وسرعة المعالجة والانتباه المزدوج.','/capabilities/kids-lab/attention/'],
  ['الذاكرة',memoryActivityCount,'7 سلاسل للذاكرة البصرية والمكانية والتسلسلية والسمعية والترابطية وذاكرة التعليمات والتذكر بعد التداخل.','/capabilities/kids-lab/memory/'],
  ['الوظائف التنفيذية',executiveActivityCount,'8 سلاسل لكبح الاستجابة والمرونة والتخطيط وترتيب الخطوات ومراقبة الأخطاء وبدء المهمة والاستمرار واكتشاف القاعدة.','/capabilities/kids-lab/executive-functions/'],
  ['الإدراك البصري',visualPerceptionActivityCount,'7 سلاسل للتمييز البصري والشكل والخلفية والإغلاق والعلاقات المكانية وثبات الشكل والدوران والجزء والكل.','/capabilities/kids-lab/visual-perception/'],
  ['التكامل البصري الحركي',visualMotorActivityCount,'6 سلاسل لتتبع المسارات والمتاهات ووصل النقاط ونسخ الأشكال والنسخ على الشبكة ودقة العين واليد.','/capabilities/kids-lab/visual-motor/'],
  ['المهارات الحركية الدقيقة وما قبل الكتابة',fineMotorActivityCount,'6 سلاسل للخطوط والأقواس والدوائر والقص والتلوين والتحكم بالقلم وأنماط الاستعداد للكتابة.','/capabilities/kids-lab/fine-motor/'],
  ['التآزر الثنائي وعبور خط المنتصف',bilateralTotal,'5 سلاسل للحركة المتزامنة والرسم المرآتي واتجاهات اليدين المختلفة وعبور خط المنتصف والإيقاع والتوقف.','/capabilities/kids-lab/bilateral/'],
  ['اللغة والاستعداد للقراءة',languageReadingActivityCount,'6 سلاسل عربية للقافية والصوت الأول والمقاطع وتمييز الحروف ومطابقة الحرف بالصورة والتسلسل القصصي.','/capabilities/kids-lab/language-reading/'],
  ['التفكير الرياضي والمنطقي',mathLogicActivityCount,'5 سلاسل للأنماط والتصنيف والكمية والمقارنة والترتيب والتسلسل والمنطق البصري.','/capabilities/kids-lab/math-logic/'],
  ['التنظيم الانفعالي',emotionalRegulationActivityCount,'4 سلاسل لفهم المشاعر وإشارات الجسم وشدة الشعور واختيار استراتيجية تنظيم مناسبة للسياق.','/capabilities/kids-lab/emotional-regulation/'],
  ['المهارات الاجتماعية',socialActivityCount,'3 سلاسل لفهم الأدلة الاجتماعية والدور والمنظور وحل المواقف مع احترام الحدود والرفض وتعدد الحلول.','/capabilities/kids-lab/social-skills/'],
  ['الوعي الحسي والتنظيم الذاتي',sensorySelfActivityCount,'سلسلتان لاكتشاف ما يساعد الطفل ووصف حالة الطاقة والاستعداد مع إعادة التقييم وتغيير الخطة عند الحاجة.','/capabilities/kids-lab/sensory-self-regulation/'],
] as const;

const flow=[
  ['1','اختر السلسلة','ابدأ من المهارة المطلوبة والعمر والقدرة الحالية، لا من اسم التشخيص وحده.'],
  ['2','ابدأ بالمستوى المناسب','كل سلسلة تتدرج من مهام واضحة وبسيطة إلى مهام تتطلب استقلالًا واستدلالًا أكبر.'],
  ['3','تدرّب ثم اختبر','تحتوي المستويات على تدريب واختبار إتقان مستقل؛ وبعد المراجعة النهائية حُذفت خمسة تدريبات أولية متكررة بدل إبقاء الحشو.'],
  ['4','انتقل بناءً على الأداء','إذا أتقن الطفل المهارة انتقل للمستوى التالي، وإلا استخدم تدريبًا إضافيًا أو تكييفًا مناسبًا.'],
];

function seriesHref(category:string,slug:string){
  if(category==='attention')return `/capabilities/kids-lab/attention/${slug}/`;
  if(category==='memory')return `/capabilities/kids-lab/memory/${slug}/`;
  if(category==='executive-functions')return `/capabilities/kids-lab/executive-functions/${slug}/`;
  if(category==='visual-perception')return `/capabilities/kids-lab/visual-perception/${slug}/`;
  if(category==='visual-motor')return `/capabilities/kids-lab/visual-motor/${slug}/`;
  if(category==='fine-motor')return `/capabilities/kids-lab/fine-motor/${slug}/`;
  if(category==='bilateral')return slug==='bilateral-tracks'?'/capabilities/kids-lab/bilateral-tracks/':`/capabilities/kids-lab/bilateral/${slug}/`;
  if(category==='language-reading')return `/capabilities/kids-lab/language-reading/${slug}/`;
  if(category==='math-logic')return `/capabilities/kids-lab/math-logic/${slug}/`;
  if(category==='emotional-regulation')return `/capabilities/kids-lab/emotional-regulation/${slug}/`;
  if(category==='social-skills')return `/capabilities/kids-lab/social-skills/${slug}/`;
  if(category==='sensory-self-regulation')return `/capabilities/kids-lab/sensory-self-regulation/${slug}/`;
  return null;
}

export default function KidsLabPage(){
  const completed=attentionActivityCount+memoryActivityCount+executiveActivityCount+visualPerceptionActivityCount+visualMotorActivityCount+fineMotorActivityCount+bilateralTotal+languageReadingActivityCount+mathLogicActivityCount+emotionalRegulationActivityCount+socialActivityCount+sensorySelfActivityCount;
  const breadcrumbs=breadcrumbJsonLd([{name:'الرئيسية',path:'/'},{name:'لنرتقي بقدراتهم',path:'/sectors/capabilities'},{name:'مختبر الأنشطة والاختبارات للأطفال',path:'/capabilities/kids-lab/'}]);
  const collection={'@context':'https://schema.org','@type':'CollectionPage','@id':`${SITE_URL}/capabilities/kids-lab/#collection`,url:`${SITE_URL}/capabilities/kids-lab/`,name:'مختبر الأنشطة والاختبارات للأطفال',inLanguage:'ar',isAccessibleForFree:true,numberOfItems:completed};
  return <><SiteHeader/><main className={styles.shell}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify([breadcrumbs,collection]).replace(/</g,'\\u003c')}}/>
    <nav className="breadcrumbs"><Link href="/">الرئيسية</Link><span>/</span><Link href="/sectors/capabilities">لنرتقي بقدراتهم</Link><span>/</span><span>مختبر الأطفال</span></nav>
    <section className={styles.hero}><span className={styles.kicker}>مكتبة نهائية منقحة قابلة للمعاينة والطباعة</span><h1>مختبر الأنشطة والاختبارات للأطفال</h1><p className={styles.lead}>1000 عنصر نهائي موزع على 67 سلسلة وخمسة مستويات. تمت مراجعة مطابقة المهمة للرسم، مواضع النصوص والعناصر، التدرج، وتقليل التلميحات في الاختبارات، ثم حُذفت خمسة تدريبات أولية منخفضة القيمة الهامشية بدل الاحتفاظ بالتكرار.</p><div className={styles.stats}><div className={styles.stat}><strong>{kidsLabSeries.length}</strong><span>سلسلة مهارية</span></div><div className={styles.stat}><strong>{KIDS_LAB_LEVELS}</strong><span>مستويات لكل سلسلة</span></div><div className={styles.stat}><strong>{completed}</strong><span>عنصرًا نهائيًا</span></div><div className={styles.stat}><strong>{KIDS_LAB_TARGET_ITEMS}</strong><span>الهدف النهائي</span></div></div></section>
    <section className={styles.section}><div className={styles.flow}>{flow.map(([n,t,b])=><article className={styles.flowCard} key={n}><span className={styles.flowNumber}>{n}</span><h3>{t}</h3><p>{b}</p></article>)}</div></section>
    {completedCards.map(([title,count,body,href])=><section className={styles.section} key={title}><div className={styles.launchCard}><div><span className={styles.kicker}>مجال مكتمل ومنقح</span><h2>{title} - {count} عنصرًا</h2><p>{body}</p><div className={styles.actions}><Link className={styles.primaryButton} href={href}>افتح المجال</Link></div></div><div className={styles.launchVisual} aria-hidden="true"><div className={styles.track}/><div className={`${styles.track} ${styles.trackBlue}`}/></div></div></section>)}
    <section className={styles.section}><div className={styles.sectionHead}><div><h2>خريطة السلاسل الـ67</h2><p>جميع السلاسل مكتملة. المكتبة النهائية تحتوي 1000 عنصر بعد التنقيح، مع بقاء جميع اختبارات الإتقان والمستويات المتقدمة.</p></div></div><div className={styles.categoryGrid}>{kidsLabCategories.map(category=><article className={styles.categoryCard} style={{'--category-color':category.color} as React.CSSProperties} key={category.slug}><h3>{category.title}</h3><p>{category.summary}</p><div className={styles.seriesList}>{category.series.map(series=>{const href=seriesHref(category.slug,series.slug);return href?<Link href={href} className={styles.seriesActive} key={series.slug}><span className={styles.seriesNumber}>{series.number}</span><span><strong>{series.title}</strong><small>{series.example}</small></span><span className={styles.readyBadge}>جاهزة</span></Link>:null})}</div></article>)}</div></section>
    <section className={styles.section}><div className={styles.note}><strong>حدود الاستخدام:</strong> هذه المكتبة للتدريب والملاحظة واختبارات الإتقان التعليمية، وليست بديلًا عن الاختبارات المعيارية المرخصة أو التشخيص المهني.</div></section>
  </main><SiteFooter/></>;
}
