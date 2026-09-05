import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import AssessmentMeasureOperationalForm from '@/components/assessment-measure-operational-form';
import MeasurePrintButton from '@/components/measure-print-button';
import { assessmentMeasureRouteSlugs, getAssessmentMeasure, getCanonicalAssessmentMeasureSlug } from '@/lib/assessment-measures-catalog';
import { getOperationalMaterial } from '@/lib/assessment-measure-operational';
import styles from '@/components/assessment-measures.module.css';

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return assessmentMeasureRouteSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const measure = getAssessmentMeasure(slug);
  if (!measure) return {};
  return {
    title: `${measure.nameAr} (${measure.acronym}) — نموذج قابل للطباعة`,
    description: `ورقة تطبيق وتسجيل قابلة للطباعة لمقياس ${measure.nameAr}.`,
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

  return (
    <main className={styles.printShell}>
      <div className={styles.printToolbar}>
        <Link href={`/assessment-measures/${measure.slug}/`}>← العودة إلى دليل المقياس</Link>
        <MeasurePrintButton />
      </div>
      <AssessmentMeasureOperationalForm material={material} printable />
    </main>
  );
}
