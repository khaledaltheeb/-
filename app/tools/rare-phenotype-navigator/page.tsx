import type { Metadata } from 'next';
import Link from 'next/link';
import RarePhenotypeNavigator from '@/components/rare-phenotype-navigator';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';
import './rare-phenotype-navigator.css';

export const metadata: Metadata = buildSeoMetadata({
  title: 'مستكشف النمط الظاهري للأمراض النادرة',
  description: 'أداة عربية لبناء ملف HPO، ترتيب فرضيات الأمراض والجينات بالتشابه الدلالي، واقتراح أسئلة Phenotyping تالية وتصدير GA4GH Phenopacket.',
  path: '/tools/rare-phenotype-navigator',
  index: true,
  follow: true,
  keywords: ['HPO', 'الأمراض النادرة', 'phenotyping', 'Phenopacket', 'Monarch Initiative', 'التشخيص الجيني', 'النمط الظاهري'],
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
  description: 'Phenotype-first research and clinical-support workspace using HPO identifiers, Arabic phenotype mappings, Monarch semantic similarity and GA4GH Phenopacket export.',
  featureList: ['Arabic phenotype lookup', 'HPO profile builder', 'Disease semantic similarity', 'Gene semantic similarity', 'Next phenotype questions', 'GA4GH Phenopacket JSON export'],
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
          <p>مساحة عربية مفتوحة لبناء phenotype profile منظم، ترتيب فرضيات الأمراض والجينات بالتشابه الدلالي، ثم معرفة أي phenotypes تستحق التحقق منها تاليًا وتصدير الملف بصيغة GA4GH Phenopacket.</p>
          <div className="rare-nav-hero-actions"><a href="#workspace">ابدأ بناء الملف</a><Link href="/content/rare-disease-ai-phenotyping-diagnostic-support">اقرأ المنهج العلمي</Link></div>
        </div>
        <aside aria-label="مبادئ الأداة">
          <strong>ليست أداة تشخيص ذاتي</strong>
          <p>الهدف هو تحسين توصيف الحالة وترتيب فرضيات قابلة للمراجعة. لا تنتج الأداة تشخيصًا نهائيًا أو قرارًا علاجيًا.</p>
          <ul><li>HPO IDs قابلة للتتبع</li><li>Semantic similarity بدل تخمين LLM</li><li>تصدير Phenopacket قابل للتبادل</li><li>لا حاجة لإرسال بيانات شخصية</li></ul>
        </aside>
      </header>

      <section className="rare-nav-value" aria-labelledby="rare-nav-value-title">
        <div className="section-heading"><span>لماذا هذه الأداة مختلفة؟</span><h2 id="rare-nav-value-title">من قائمة أعراض إلى حلقة تعلم قابلة لإعادة التحليل</h2><p>القيمة ليست في إعطاء اسم مرض بسرعة؛ بل في بناء ملف معياري يمكن تحسينه كلما ظهرت معلومة جديدة أو تغيرت قواعد المعرفة.</p></div>
        <div className="rare-nav-value-grid">
          <article><strong>01</strong><h3>توحيد اللغة السريرية</h3><p>يربط المصطلح العربي بمعرّف HPO ثابت بدل الاعتماد على وصف حر يصعب مقارنته أو مشاركته.</p></article>
          <article><strong>02</strong><h3>ترتيب قابل للتفسير</h3><p>Monarch يحسب التشابه الدلالي بين phenotype profile وارتباطات الأمراض والجينات؛ النتيجة درجة تشابه وليست احتمالًا.</p></article>
          <article><strong>03</strong><h3>سؤال سريري تالي</h3><p>تستخرج الأداة phenotypes متكررة في أعلى الفرضيات ولم تُسجل بعد، لتوجيه الفحص التالي بدل إضافة اختبارات عشوائية.</p></article>
          <article><strong>04</strong><h3>ملف قابل للنقل</h3><p>يمكن تصدير GA4GH Phenopacket JSON للاحتفاظ بالملف، مراجعته، أو استخدامه لاحقًا في أنظمة متوافقة.</p></article>
        </div>
      </section>

      <div id="workspace"><RarePhenotypeNavigator /></div>

      <section className="rare-nav-sources" aria-labelledby="rare-nav-sources-title">
        <div className="section-heading"><span>المصادر والمنهج</span><h2 id="rare-nav-sources-title">كل طبقة لها مصدر وحدود واضحة</h2></div>
        <div className="rare-nav-source-grid">
          <article><h3>Human Phenotype Ontology</h3><p>المعرّفات والبنية المفاهيمية للنمط الظاهري. HPO هو المرجع الدلالي، بينما العربية الحالية تأتي من طبقة مستقلة موضحة أدناه.</p><a href="https://hpo.jax.org/" target="_blank" rel="noreferrer">HPO ↗</a></article>
          <article><h3>PAVS Arabic HPO</h3><p>طبقة عربية مستقلة لترجمات HPO، وليست النسخة العربية الرسمية الكاملة لـHPO. تُستخدم لتسهيل الإدخال العربي مع إبقاء HPO ID أساسًا.</p><a href="https://github.com/bio-ontology-research-group/hpo-arabic" target="_blank" rel="noreferrer">المصدر والترخيص ↗</a></article>
          <article><h3>Monarch Initiative</h3><p>المطابقة الدلالية للأمراض والجينات تستخدم Monarch v3 semantic similarity وبيانات الارتباطات الحالية.</p><a href="https://api-v3.monarchinitiative.org/v3/docs" target="_blank" rel="noreferrer">Monarch API ↗</a></article>
          <article><h3>GA4GH Phenopackets</h3><p>التصدير يستخدم بنية Phenopacket v2 لتسهيل نقل phenotype profile بين الأدوات والبحوث.</p><a href="https://phenopacket-schema.readthedocs.io/" target="_blank" rel="noreferrer">Phenopacket Schema ↗</a></article>
        </div>
      </section>

      <section className="rare-nav-roadmap" aria-labelledby="rare-nav-roadmap-title">
        <div><span>الإصدار الأول</span><h2 id="rare-nav-roadmap-title">ما الذي سنضيفه لاحقًا؟</h2></div>
        <p>النسخة الحالية تؤسس طبقة phenotype معيارية وآمنة. التطوير التالي سيضيف مقارنة longitudinal بين الزيارات، provenance للإصدارات، إعادة تحليل تلقائية عند تحديث قواعد المعرفة، دعم functional assays وVUS، وطبقة cohort/federated registry للبحث دون تجميع بيانات تعريفية في مكان واحد.</p>
      </section>
    </main>
    <SiteFooter />
  </>;
}
