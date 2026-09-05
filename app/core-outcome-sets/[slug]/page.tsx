import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { buildSeoMetadata, SITE_URL } from '@/lib/seo';
import { getCoreOutcomeRecord } from '@/lib/core-outcome-sets/registry';
import { getInstrumentCrosswalkForCos } from '@/lib/core-outcome-sets/instrument-crosswalk-registry';
import styles from '@/components/assessment-measures.module.css';

type PageProps = { params: Promise<{ slug: string }> };

// OpenNext/Cloudflare currently fails while serving these prerendered dynamic
// App Router paths even though the production build generates them correctly.
// The data is local/versioned, so SSR avoids the broken dynamic-SSG serving
// path without introducing a database dependency or changing public URLs.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getCoreOutcomeRecord(slug);
  if (!item) return {};
  return buildSeoMetadata({
    title: `${item.titleAr} — Core Outcome Set`,
    description: `${item.summary} نطاق التطبيق، النتائج الأساسية، حالة أدوات القياس وحالة التقييم العربي مع المصدر الأصلي.`,
    path: `/core-outcome-sets/${item.slug}/`,
    index: true,
    follow: true,
    type: 'article',
    keywords: [item.condition, item.healthArea, 'Core Outcome Set', 'COMET', 'COMS', 'أدوات قياس النتائج', 'التكييف العربي'],
    relatedTerms: item.coreOutcomes,
    searchIntents: [`ما هي النتائج الأساسية في ${item.condition}`, `Core Outcome Set ${item.condition}`, `كيف أقيس نتائج ${item.condition}`],
  });
}

export default async function CoreOutcomeSetDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getCoreOutcomeRecord(slug);
  if (!item) notFound();
  const crosswalk = getInstrumentCrosswalkForCos(item.slug);

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': `${SITE_URL}/core-outcome-sets/${item.slug}/#page`,
    url: `${SITE_URL}/core-outcome-sets/${item.slug}/`,
    name: item.titleAr,
    description: item.summary,
    inLanguage: 'ar',
    dateModified: item.source.lastVerified,
    isPartOf: { '@id': `${SITE_URL}/core-outcome-sets/#page` },
    publisher: { '@id': `${SITE_URL}/#organization` },
  };

  return (
    <>
      <SiteHeader />
      <main className={styles.shell}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />

        <nav className={styles.breadcrumbs} aria-label="مسار الصفحة">
          <Link href="/">الرئيسية</Link><span>/</span><Link href="/assessment-lab/">Assessment Lab</Link><span>/</span><Link href="/core-outcome-sets/">Core Outcome Sets</Link><span>/</span><span aria-current="page">{item.condition}</span>
        </nav>

        <section className={styles.hero}>
          <span className={styles.eyebrow}>{item.healthArea} · COMET registry</span>
          <h1>{item.titleAr}</h1>
          <p>{item.titleEn}</p>
          <p>{item.summary}</p>
          <div className={styles.heroActions}>
            <a className={styles.primaryAction} href={item.source.cometUrl} target="_blank" rel="noreferrer">السجل الأصلي في COMET ↗</a>
            {item.source.doi ? <a className={styles.secondaryAction} href={item.source.doi} target="_blank" rel="noreferrer">المنشور/DOI ↗</a> : null}
            <Link className={styles.secondaryAction} href="/core-outcome-sets/instrument-crosswalk/">خريطة الأدوات والدليل العربي</Link>
            <Link className={styles.secondaryAction} href="/assessment-measures/">مكتبة أدوات القياس</Link>
          </div>
          <div className={styles.notice}><strong>حالة روافد:</strong> السجل موثق من المصدر، لكن التقييم العربي لا يُفترض تلقائيًا. حالة ملاءمة COS للسياق العربي وحالة النسخ العربية من الأدوات موضحتان أدناه كلٌ على حدة.</div>
        </section>

        <section className={styles.section} aria-labelledby="scope-title">
          <div className={styles.sectionHead}><div><h2 id="scope-title">نطاق المجموعة</h2><p>هذه الحقول تمنع استخدام COS خارج المجتمع أو التدخل أو السياق الذي طُوّر من أجله.</p></div></div>
          <div className={styles.methodGrid}>
            <article className={styles.methodCard}><h3>الحالة/المجال</h3><p>{item.condition}</p></article>
            <article className={styles.methodCard}><h3>السكان</h3><p>{item.scope.population}</p></article>
            <article className={styles.methodCard}><h3>العمر</h3><p>{item.scope.age}</p></article>
            <article className={styles.methodCard}><h3>التدخل</h3><p>{item.scope.intervention}</p></article>
            <article className={styles.methodCard}><h3>سياق الاستخدام</h3><p>{item.scope.useContext}</p></article>
            <article className={styles.methodCard}><h3>السياق الجغرافي</h3><p>{item.scope.geography}</p></article>
          </div>
          <div className={styles.callout}><strong>تصنيف COMET:</strong> {item.cometClassification.join(' · ')} · <strong>المرحلة:</strong> {item.stageLabel}</div>
        </section>

        <section className={styles.section} aria-labelledby="outcomes-title">
          <div className={styles.sectionHead}><div><h2 id="outcomes-title">ماذا نقيس؟ — Core outcomes</h2><p>هذه هي طبقة WHAT. لا تتحول أسماء النتائج تلقائيًا إلى استبيانات أو درجات.</p></div></div>
          <div className={styles.grid}>
            {item.coreOutcomes.map((outcome) => <article className={styles.card} key={outcome}><div className={styles.cardMeta}><span className={styles.badge}>Core outcome</span></div><h3>{outcome}</h3></article>)}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="measurement-title">
          <div className={styles.sectionHead}><div><h2 id="measurement-title">كيف نقيس؟ — COMS / measurement recommendations</h2><p>{item.measurementStatusLabel}</p></div></div>
          <div className={styles.panel}>
            {item.measurementRecommendations.length ? <ul>{item.measurementRecommendations.map((measure) => <li key={measure}>{measure}</li>)}</ul> : <p>لم تسجل روافد توصية أداة قياس صريحة لهذا COS حتى الآن.</p>}
            <p><strong>قاعدة التطبيق:</strong> وجود توصية بقياس معين لا يلغي الحاجة إلى مراجعة خصائص القياس والجدوى والحقوق والإصدار المستخدم.</p>
          </div>
        </section>

        {crosswalk.length > 0 ? <section className={styles.section} aria-labelledby="instrument-crosswalk-title">
          <div className={styles.sectionHead}><div><h2 id="instrument-crosswalk-title">ما حالة الأدوات المرتبطة بهذا COS داخل روافد؟</h2><p>هذه الطبقة تتبع الأدوات التي دققناها حتى الآن ولا تدعي اكتمال COMS كله.</p></div></div>
          <div className={styles.grid}>
            {crosswalk.map((instrument) => <article className={styles.card} key={instrument.id}>
              <div className={styles.cardMeta}><span className={styles.badge}>{instrument.rawafidStatusLabel}</span><span className={styles.badge}>{instrument.arabicEvidenceLabel}</span></div>
              <h3>{instrument.acronym}</h3>
              <p>{instrument.instrument}</p>
              <div className={styles.cardFoot}><span><strong>الحقوق:</strong> {instrument.rightsNote}</span></div>
              <div className={styles.cardFoot}><span><strong>العربية:</strong> {instrument.arabicEvidenceNote}</span></div>
              <div className={styles.sourceLinks}>
                {instrument.internalPath ? <Link href={instrument.internalPath}>سجل الأداة في روافد ←</Link> : null}
                {instrument.evidenceUrl ? <a href={instrument.evidenceUrl} target="_blank" rel="noreferrer">مصدر الدليل ↗</a> : null}
              </div>
            </article>)}
          </div>
          <div className={styles.sourceLinks}><Link href="/core-outcome-sets/instrument-crosswalk/">افتح الـInstrument Crosswalk الكامل ←</Link></div>
        </section> : null}

        <section className={styles.section} aria-labelledby="arabic-review-title">
          <div className={styles.sectionHead}><div><h2 id="arabic-review-title">حالة التقييم العربي</h2><p>نحافظ على فصلين: ملاءمة COS نفسه للسياق المحلي، وملاءمة أداة القياس باللغة العربية.</p></div></div>
          <div className={styles.methodGrid}>
            <article className={styles.methodCard}><h3>ملاءمة COS للسياق العربي</h3><p>{item.arabicReview.cosContext === 'not-assessed' ? 'غير مقيمة بعد.' : 'تحتاج مراجعة محلية منظمة قبل التبني المباشر.'}</p></article>
            <article className={styles.methodCard}><h3>التكييف والتحقق العربي للأدوات</h3><p>{crosswalk.length > 0 ? `تم تدقيق ${crosswalk.length.toLocaleString('ar')} أداة/عائلة أدوات مرتبطة في الـCrosswalk الحالي؛ راجع كل بطاقة لأن الحالات تتراوح بين دليل سيكومتري سياقي وترجمة رسمية وفجوة غير مدققة.` : 'غير مقيم بعد على مستوى الأدوات المرتبطة بهذا السجل.'}</p></article>
          </div>
          <div className={styles.callout}>{item.arabicReview.note}</div>
        </section>

        <section className={styles.section} aria-labelledby="stakeholders-title">
          <div className={styles.sectionHead}><div><h2 id="stakeholders-title">أصحاب المصلحة والاستخدام داخل روافد</h2></div></div>
          <div className={styles.methodGrid}>
            <article className={styles.methodCard}><h3>أصحاب المصلحة في التطوير</h3><p>{item.stakeholders.join(' · ')}</p></article>
            <article className={styles.methodCard}><h3>قطاعات روافد المرتبطة</h3><p>{item.rawafidSectors.join(' · ')}</p></article>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="quality-title">
          <div className={styles.panel}>
            <h2 id="quality-title">المصدر وحالة المراجعة</h2>
            <p>{item.qualityNote}</p>
            <p><strong>سنة المنشور:</strong> {item.source.publicationYear} · <strong>آخر تحقق من سجل روافد:</strong> {item.source.lastVerified}</p>
            <div className={styles.sourceList}>
              <a href={item.source.cometUrl} target="_blank" rel="noreferrer">COMET Initiative — السجل الأصلي ↗</a>
              {item.source.doi ? <a href={item.source.doi} target="_blank" rel="noreferrer">المنشور الأصلي / DOI ↗</a> : null}
              {item.source.secondaryUrl ? <a href={item.source.secondaryUrl} target="_blank" rel="noreferrer">مصدر/دراسة مرتبطة ↗</a> : null}
              <Link href="/core-outcome-sets/instrument-crosswalk/">خريطة الأدوات والدليل العربي</Link>
              <Link href="/core-outcome-sets/">العودة إلى سجل Core Outcome Sets</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
