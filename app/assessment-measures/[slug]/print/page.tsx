import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import AssessmentMeasureOperationalForm from '@/components/assessment-measure-operational-form';
import MeasurePrintButton from '@/components/measure-print-button';
import { assessmentMeasureRouteSlugs, getAssessmentMeasure, getCanonicalAssessmentMeasureSlug } from '@/lib/assessment-measures-catalog';
import { getOperationalMaterial, hasExplicitOperationalMaterial } from '@/lib/assessment-measure-operational-catalog';
import styles from '@/components/assessment-measures.module.css';

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return assessmentMeasureRouteSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const measure = getAssessmentMeasure(slug);
  if (!measure) return {};
  const hasExplicitOperational = hasExplicitOperationalMaterial(measure.slug);
  return {
    title: hasExplicitOperational
      ? `${measure.nameAr} (${measure.acronym}) — مادة تشغيلية قابلة للطباعة`
      : `${measure.nameAr} (${measure.acronym}) — ورقة توثيق عامة قابلة للطباعة`,
    description: hasExplicitOperational
      ? `مادة تطبيق وتسجيل موثقة قابلة للطباعة لمقياس ${measure.nameAr}.`
      : `ورقة توثيق عامة قابلة للطباعة مرتبطة بمقياس ${measure.nameAr}؛ ليست نسخة من النموذج الأصلي ولا ترجمة عربية معتمدة.`,
    robots: { index: false, follow: true },
  };
}

export default async function AssessmentMeasurePrintPage({ params }: PageProps) {
  const { slug } = await params;
  const canonicalSlug = getCanonicalAssessmentMeasureSlug(slug);
  if (canonicalSlug !== slug) permanentRedirect(`/assessment-measures/${canonicalSlug}/print/`);

  const measure = getAssessmentMeasure(canonicalSlug);
  if (!measure) notFound();
  const material = getOperationalMaterial(measure);
  const hasExplicitOperational = hasExplicitOperationalMaterial(measure.slug);

  return (
    <main className={styles.printShell}>
      <div className={styles.printToolbar}>
        <Link href={`/assessment-measures/${measure.slug}/`}>← العودة إلى دليل المقياس</Link>
        <MeasurePrintButton />
      </div>
      {!hasExplicitOperational && (
        <section className={styles.statusBox} aria-label="تنبيه حول ورقة الطباعة">
          <strong>ورقة توثيق عامة — ليست نموذج المقياس</strong>
          <p>هذه الصفحة تسهّل توثيق التطبيق والنسخة والنتائج فقط. لا تتضمن بنود المقياس الأصلي ولا تمثل ترجمة عربية معتمدة أو خوارزمية تشغيلية مكتملة.</p>
        </section>
      )}
      <AssessmentMeasureOperationalForm material={material} printable />
    </main>
  );
}
