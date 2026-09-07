import { notFound, permanentRedirect } from 'next/navigation';

type Params = Promise<{ slug: string }>;

const canonicalAssessmentRoutes: Record<string, string> = {
  'gad-7': '/assessment-lab/gad-7-plus',
  'phq-9': '/assessment-lab/phq-9-plus',
  'who-5': '/assessment-lab/who-5-plus',
};

/**
 * These three URLs are historical entry points that previously duplicated
 * interactive copies of measures now documented under Assessment Lab with a
 * stronger rights/provenance layer. Preserve every old URL, but keep one
 * canonical representation of each source instrument.
 */
export default async function HistoricalAssessmentRedirect({ params }: { params: Params }) {
  const { slug } = await params;
  const destination = canonicalAssessmentRoutes[slug];
  if (!destination) notFound();
  permanentRedirect(destination);
}
