import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ContentRenderer from '@/components/content-renderer';
import SiteFooter from '@/components/site-footer';
import SiteHeader from '@/components/site-header';
import { getLegacyGuide, legacyGuideSlugs } from '@/lib/legacy-guides';
import { breadcrumbJsonLd, buildSeoMetadata, SITE_URL } from '@/lib/seo';
import { createClient } from '@/lib/supabase/server';
import styles from '../legacy-guides.module.css';

type Params = Promise<{ slug: string }>;
type GuideReference = { title?: string; url?: string; publisher?: string; year?: string | number };
type CurrentGuideRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_json: unknown;
  body_text: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  published_at: string | null;
  updated_at: string | null;
  primary_keyword: string | null;
  secondary_keywords: string[] | null;
  semantic_terms: string[] | null;
  author_display_name: string | null;
  reviewer_display_name: string | null;
  reviewer_credentials: string | null;
  last_reviewed_at: string | null;
  references_json: GuideReference[] | null;
  medical_disclaimer: string | null;
};

const CURRENT_GUIDE_FIELDS = 'id,slug,title,excerpt,body_json,body_text,seo_title,seo_description,canonical_url,robots_index,robots_follow,published_at,updated_at,primary_keyword,secondary_keywords,semantic_terms,author_display_name,reviewer_display_name,reviewer_credentials,last_reviewed_at,references_json,medical_disclaimer';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export function generateStaticParams() { return legacyGuideSlugs.map((slug) => ({ slug })); }

function safeGuideRouteSlug(value: string) {
  try {
    const decoded = decodeURIComponent(value).trim().replace(/^\/+|\/+$/g, '');
    return decoded && !decoded.includes('/') && !decoded.includes('..') ? decoded : null;
  } catch {
    return null;
  }
}

async function getCurrentGuide(routeSlug: string): Promise<CurrentGuideRecord | null> {
  const safe = safeGuideRouteSlug(routeSlug);
  if (!safe) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('content')
    .select(CURRENT_GUIDE_FIELDS)
    .eq('content_type', 'guide')
    .eq('status', 'published')
    .eq('canonical_url', `/guides/${safe}/`)
    .lte('published_at', new Date().toISOString())
    .maybeSingle();
  if (error) throw error;
  return data as unknown as CurrentGuideRecord | null;
}

function safeGuideReferences(value: GuideReference[] | null) {
  return (value ?? []).filter((item) => typeof item?.url === 'string' && /^https:\/\//i.test(item.url));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getLegacyGuide(slug);
  if (guide) {
    return buildSeoMetadata({
      title: guide.title,
      description: `${guide.definition} نسخة منقولة ومطورة من الدليل التاريخي في روافد، مع أسئلة عملية ومصدر رسمي وحدود واضحة للتثقيف العام.`,
      path: `/guides/${guide.slug}`,
      index: false,
      follow: true,
    });
  }
  const record = await getCurrentGuide(slug);
  if (!record) return {};
  return buildSeoMetadata({
    title: record.seo_title || record.title,
    description: record.seo_description || record.excerpt,
    path: record.canonical_url || `/guides/${slug}/`,
    index: record.robots_index,
    follow: record.robots_follow,
    type: 'article',
    keywords: [record.primary_keyword, ...(record.secondary_keywords ?? []), ...(record.semantic_terms ?? []).slice(0, 10)].filter(Boolean) as string[],
    publishedTime: record.published_at,
    modifiedTime: record.updated_at,
    authors: record.author_display_name ? [{ name: record.author_display_name }] : undefined,
  });
}

function CurrentGuidePage({ record }: { record: CurrentGuideRecord }) {
  const canonical = record.canonical_url || `/guides/${safeGuideRouteSlug(record.slug) ?? record.slug}/`;
  const url = canonical.startsWith('https://') ? canonical : `${SITE_URL}${canonical}`;
  const references = safeGuideReferences(record.references_json);
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'الأدلة', path: '/guides' },
    { name: record.title, path: canonical },
  ]);
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    url,
    headline: record.title,
    description: record.seo_description || record.excerpt || undefined,
    inLanguage: 'ar',
    datePublished: record.published_at || undefined,
    dateModified: record.updated_at || undefined,
    author: record.author_display_name ? { '@type': 'Organization', name: record.author_display_name } : { '@id': `${SITE_URL}/#organization` },
    reviewedBy: record.reviewer_display_name ? { '@type': 'Organization', name: record.reviewer_display_name } : undefined,
    publisher: { '@id': `${SITE_URL}/#organization` },
    citation: references.map((item) => item.url),
    isPartOf: { '@id': `${SITE_URL}/#website` },
  };
  return <><SiteHeader/><main className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbs, articleSchema]).replace(/</g, '\\u003c') }}/>
    <section className={styles.hero}><div className={styles.shell}>
      <nav className={styles.breadcrumbs} aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/guides">الأدلة</Link><span>/</span><span>{record.title}</span></nav>
      <span className={styles.eyebrow}>دليل منشور ومراجع</span>
      <h1>{record.title}</h1>{record.excerpt&&<p className={styles.lead}>{record.excerpt}</p>}
      {(record.reviewer_display_name || record.last_reviewed_at) && <p className={styles.transferNote}>
        {record.reviewer_display_name && <>مراجعة: {record.reviewer_display_name}{record.reviewer_credentials ? ` — ${record.reviewer_credentials}` : ''}</>}
        {record.reviewer_display_name && record.last_reviewed_at ? ' · ' : ''}
        {record.last_reviewed_at && <>آخر مراجعة: {new Intl.DateTimeFormat('ar', { dateStyle: 'long' }).format(new Date(record.last_reviewed_at))}</>}
      </p>}
    </div></section>
    <section className={`${styles.shell} ${styles.content}`}>
      <article className={styles.card}>
        <ContentRenderer bodyJson={record.body_json} bodyText={record.body_text} recordId={record.id}/>
      </article>
      {references.length > 0 && <article className={styles.evidence}>
        <span className={styles.eyebrow}>المصادر والمراجع</span><h2>مصادر الدليل</h2>
        <ol>{references.map((reference, index) => <li key={`${reference.url}-${index}`}><a href={reference.url} target="_blank" rel="noopener noreferrer">{reference.title || reference.url}</a>{reference.publisher ? ` — ${reference.publisher}` : ''}</li>)}</ol>
      </article>}
      {record.medical_disclaimer && <article className={styles.safety}><h2>حدود المحتوى</h2><p>{record.medical_disclaimer}</p><Link href="/disclaimer">إخلاء المسؤولية الكامل</Link></article>}
    </section>
  </main><SiteFooter/></>;
}

export default async function LegacyGuidePage({ params }: { params: Params }) {
  const { slug } = await params;
  const guide = getLegacyGuide(slug);
  if (!guide) {
    const current = await getCurrentGuide(slug);
    if (!current) notFound();
    return <CurrentGuidePage record={current}/>;
  }
  const breadcrumbs = breadcrumbJsonLd([
    { name: 'الرئيسية', path: '/' },
    { name: 'الأدلة المنقولة', path: '/guides' },
    { name: guide.title, path: `/guides/${guide.slug}` },
  ]);
  return <><SiteHeader/><main className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c') }}/>
    <section className={styles.hero}><div className={styles.shell}>
      <nav className={styles.breadcrumbs} aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link><span>/</span><Link href="/guides">الأدلة</Link><span>/</span><span>{guide.title}</span></nav>
      <span className={styles.eyebrow}>محتوى تاريخي منقول ومطوّر · {guide.englishLabel}</span>
      <h1>{guide.title}</h1><p className={styles.lead}>{guide.definition}</p>
      <p className={styles.transferNote}>هذه ليست صفحة تحويل. المسار التاريخي نفسه يعرض المحتوى داخل روافد الجديدة. احتفظنا بالمعلومة المفيدة من الصفحة القديمة وأضفنا سياقًا عمليًا ومصدرًا رسميًا، مع ربط اختياري بالدليل الأعمق داخل المنصة.</p>
    </div></section>

    <section className={`${styles.shell} ${styles.content}`}>
      <article className={styles.card}><span className={styles.eyebrow}>المحتوى المحفوظ من النسخة القديمة</span><h2>الفكرة الأساسية</h2>
        <p>كان الدليل القديم يقدم مدخلًا منظمًا لفهم الموضوع دون اختزاله في علامة واحدة. يبدأ الفهم بالتعريف، ثم السياق الذي تظهر فيه الخبرة، ثم مقدار أثرها في الحياة اليومية.</p>
        <h3>الأسئلة التي حافظنا عليها</h3><p>متى بدأت الخبرة؟ ما شدتها وتكرارها؟ ما المواقف التي تزيدها أو تخففها؟ وهل تؤثر في النوم أو الدراسة أو العمل أو العلاقات؟</p>
        <h3>ما الذي لا يكفي للحكم؟</h3><p>مقطع قصير، اختبار غير موثق، أو تشابه عرض واحد لا يكفي لإصدار تشخيص. عندما يكون السؤال سريريًا، يحتاج التقييم إلى تاريخ وسياق ومعلومات متعددة وفحص تفسيرات بديلة مناسبة.</p>
      </article>

      <article className={styles.card}><span className={styles.eyebrow}>تطوير النسخة الجديدة</span><h2>ما الذي يستحق الملاحظة بدل مطاردة قائمة أعراض؟</h2>
        <ul>{guide.observations.map((item) => <li key={item}>{item}</li>)}</ul>
        <p>هذه الأسئلة لا تعطي درجة ولا تستبدل التقييم المهني. فائدتها تحويل الوصف العام إلى معلومات قابلة للفهم: بداية النمط، السياق، التكرار، الأثر، وما الذي تغير مع الوقت.</p>
      </article>

      <article className={styles.card}><h2>طريقة استخدام الدليل عمليًا</h2>
        <ol>
          <li><strong>اكتب مثالين واقعيين.</strong> صف ما حدث، متى حدث، وما الأثر بدل استخدام أوصاف عامة.</li>
          <li><strong>افصل بين المعلومة والاستنتاج.</strong> «استيقظت أربع مرات» ملاحظة؛ أما «لدي اضطراب محدد» فهو استنتاج يحتاج سياقًا أوسع.</li>
          <li><strong>راجع العوامل المرافقة.</strong> النوم، الصحة الجسدية، الأدوية، الضغوط، البيئة والعلاقات قد تغير الصورة.</li>
          <li><strong>حدد سؤالًا واضحًا.</strong> هل تريد فهم المفهوم، تحسين الدعم اليومي، أم الاستعداد لتقييم مهني؟</li>
        </ol>
      </article>

      <article className={styles.evidence}><span className={styles.eyebrow}>مرجع رسمي للتحقق</span><h2>{guide.referenceTitle}</h2>
        <p>أضفنا المرجع الرسمي إلى النسخة المنقولة لأن الصفحة القديمة لم تكن تحتوي مراجع خارجية كافية. استخدم المرجع لفهم التعريف والسياق السريري العام، ولا تنقل منه تشخيصًا فرديًا إلى نفسك أو إلى شخص آخر.</p>
        <a href={guide.referenceUrl} target="_blank" rel="noreferrer">فتح المصدر الرسمي</a>
      </article>

      <article className={styles.deeper}><div><span className={styles.eyebrow}>محتوى روافد الأعمق</span><h2>{guide.primaryLabel}</h2><p>إذا أردت تفاصيل أوسع، فهذه الصفحة الداخلية تحتوي السياق المطوّر الخاص بالموضوع. وجود هذا الرابط لا يلغي الصفحة الحالية ولا يحولها؛ كلا المسارين يعملان داخل الموقع الجديد.</p></div><Link href={guide.primaryHref}>فتح الدليل الأعمق</Link></article>

      <article className={styles.safety}><h2>حدود السلامة</h2><p>المحتوى للتثقيف العام ولا يقدّم تشخيصًا فرديًا أو خطة علاج شخصية. إذا كان هناك خطر فوري على النفس أو الآخرين، فقدان شديد للاتصال بالواقع، عجز شديد عن تلبية الاحتياجات الأساسية، أو أعراض جسدية حادة، فالأولوية للحصول على مساعدة طارئة محلية مناسبة بدل متابعة القراءة.</p></article>
    </section>
  </main><SiteFooter/></>;
}
