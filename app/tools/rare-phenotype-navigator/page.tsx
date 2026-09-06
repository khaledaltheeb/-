import type { Metadata } from 'next';
import Link from 'next/link';
import RarePhenotypeNavigator from '@/components/rare-phenotype-navigator-v2';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';
import './rare-phenotype-navigator.css';
import './rare-phenotype-navigator-v2.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'مستكشف النمط الظاهري للأمراض النادرة',
  description: 'أداة عربية لبناء ملف HPO ومقارنة الأمراض والجينات والحالات المشابهة دلاليًا، واقتراح phenotyping تالٍ وتصدير GA4GH Phenopacket.',
  path: '/tools/rare-phenotype-navigator',
  index: true,
  follow: true,
  keywords: ['HPO', 'الأمراض النادرة', 'phenotyping', 'Phenopacket', 'Monarch Initiative', 'PAVS', 'التشخيص الجيني', 'النمط الظاهري'],
});

const pageUrl = `${SITE_URL}/tools/rare-phenotype-navigator`;
const breadcrumbs = breadcrumbJsonLd([
  { name: 'الرئيسية', path: '/' },
  { name: 'الأمراض النادرة', path: '/sectors/rare-diseases' },
  { name: 'مستكشف النمط الظاهري', path: '/tools/rare-phenotype-navigator' },
]);
const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  '@id': `${pageUrl}#app`,
  name: 'Rawafid Rare Phenotype Navigator',
  alternateName: 'مستكشف روافد للنمط الظاهري للأمراض النادرة',
  url: pageUrl,
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Any',
  inLanguage: ['ar', 'en'],
  isAccessibleForFree: true,
  description: 'Phenotype-first research and clinical-support workspace using HPO identifiers, Arabic phenotype mappings, Monarch semantic similarity, PAVS similar-case search and GA4GH Phenopacket export.',
  featureList: ['Arabic phenotype lookup', 'HPO profile builder', 'Disease semantic similarity', 'Gene semantic similarity', 'PAVS similar-case search', 'Cross-source convergence signals', 'Next phenotype questions', 'GA4GH Phenopacket JSON export'],
};

export default function RarePhenotypeNavigatorPage() {
  return <>
    <SiteHeader />
    <main className="rare-nav-page site-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, softwareSchema]).replace(/</g, '\\u003c') }} />
      <nav className="breadcrumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/sectors/rare-diseases">الأمراض النادرة</Link><span>/</span><span aria-current="page">مستكشف النمط الظاهري</span></nav>

      <header className="rare-nav-hero">
        <div>
          <span className="rare-nav-kicker">Rawafid Rare Phenotype Navigator</span>
          <h1>حوّل الوصف السريري إلى ملف HPO قابل للتحليل وإعادة الاستخدام</h1>
          <p>مساحة عربية مفتوحة لبناء phenotype profile منظم، ومقارنة ثلاث طبقات مستقلة: الأمراض والجينات عبر Monarch، والحالات المشابهة عبر PAVS، ثم معرفة أي phenotypes تستحق التحقق منها تاليًا وتصدير الملف بصيغة GA4GH Phenopacket.</p>
          <div className="rare-nav-hero-actions"><a href="#workspace">ابدأ بناء الملف</a><Link href="/content/rare-disease-ai-phenotyping-diagnostic-support">اقرأ المنهج العلمي</Link></div>
        </div>
        <aside aria-label="مبادئ الأداة">
          <strong>ليست أداة تشخيص ذاتي</strong>
          <p>الهدف هو تحسين توصيف الحالة وترتيب فرضيات قابلة للمراجعة. لا تنتج الأداة تشخيصًا نهائيًا أو قرارًا علاجيًا.</p>
          <ul><li>HPO IDs قابلة للتتبع</li><li>Semantic similarity بدل تخمين LLM</li><li>حالات مشابهة من PAVS مع مصدر ودرجة</li><li>تصدير Phenopacket قابل للتبادل</li><li>لا حاجة لإرسال بيانات تعريفية</li></ul>
        </aside>
      </header>

      <section className="rare-nav-value" aria-labelledby="rare-nav-value-title">
        <div className="section-heading"><span>لماذا هذه الأداة مختلفة؟</span><h2 id="rare-nav-value-title">من قائمة أعراض إلى حلقة تعلم متعددة المصادر</h2><p>القيمة ليست في إعطاء اسم مرض بسرعة؛ بل في بناء ملف معياري، ثم اختبار الفرضيات على مصدرين مستقلين للمعرفة والحالات، وإظهار الاتفاق والاختلاف بدل إخفائهما.</p></div>
        <div className="rare-nav-value-grid">
          <article><strong>01</strong><h3>توحيد اللغة السريرية</h3><p>يربط المصطلح العربي بمعرّف HPO ثابت بدل الاعتماد على وصف حر يصعب مقارنته أو مشاركته.</p></article>
          <article><strong>02</strong><h3>Triangulation بدل درجة واحدة</h3><p>نقارن ترتيب Monarch العالمي للأمراض والجينات بحالات PAVS المشابهة. أي تقاطع يُعرض كإشارة للمراجعة، لا كنسبة تشخيص.</p></article>
          <article><strong>03</strong><h3>سؤال سريري تالي</h3><p>تستخرج الأداة phenotypes متكررة في أعلى الفرضيات ولم تُسجل بعد، لتوجيه الفحص السريري التالي بدل إضافة اختبارات عشوائية.</p></article>
          <article><strong>04</strong><h3>ملف قابل للنقل</h3><p>يمكن تصدير GA4GH Phenopacket JSON للاحتفاظ بالملف ومراجعته وإعادة تحليله لاحقًا في أنظمة متوافقة.</p></article>
        </div>
      </section>

      <div id="workspace"><RarePhenotypeNavigator /></div>

      <section className="rare-nav-sources" aria-labelledby="rare-nav-sources-title">
        <div className="section-heading"><span>المصادر والمنهج</span><h2 id="rare-nav-sources-title">كل طبقة لها مصدر وحدود واضحة</h2></div>
        <div className="rare-nav-source-grid">
          <article><h3>Human Phenotype Ontology</h3><p>المعرّفات والبنية المفاهيمية للنمط الظاهري. HPO هو المرجع الدلالي، بينما العربية الحالية تأتي من طبقة مستقلة موضحة أدناه.</p><a href="https://hpo.jax.org/" target="_blank" rel="noreferrer">HPO ↗</a></article>
          <article><h3>PAVS Arabic HPO + Cases</h3><p>طبقة عربية مستقلة لترجمات HPO إضافة إلى بحث الحالات المشابهة. ليست النسخة العربية الرسمية الكاملة لـHPO، لذلك يظهر المصدر بوضوح ولا نخلط بين الاثنين.</p><a href="https://pavs.phenomebrowser.net/" target="_blank" rel="noreferrer">PAVS ↗</a></article>
          <article><h3>Monarch Initiative</h3><p>المطابقة الدلالية للأمراض والجينات تستخدم Monarch v3 semantic similarity وبيانات الارتباطات الحالية.</p><a href="https://api-v3.monarchinitiative.org/v3/docs" target="_blank" rel="noreferrer">Monarch API ↗</a></article>
          <article><h3>GA4GH Phenopackets</h3><p>التصدير يستخدم بنية Phenopacket v2 لتسهيل نقل phenotype profile بين الأدوات والبحوث.</p><a href="https://phenopacket-schema.readthedocs.io/" target="_blank" rel="noreferrer">Phenopacket Schema ↗</a></article>
        </div>
      </section>

      <section className="rare-nav-roadmap" aria-labelledby="rare-nav-roadmap-title">
        <div><span>مسار التطوير</span><h2 id="rare-nav-roadmap-title">الأداة ستتوسع مع القطاع لا بدل الصفحات العلمية</h2></div>
        <p>بعد تثبيت هذه النسخة سنضيف longitudinal phenotype diff، provenance للإصدارات، إعادة التحليل عند تحديث المعرفة، functional assays وVUS/recontact، carrier/cascade workflows، federated rare-disease registries وFAIR data، cohort design للأمراض فائقة الندرة، وdigital endpoints/wearables في دراسات التاريخ الطبيعي.</p>
      </section>
    </main>
    <SiteFooter />
  </>;
}
