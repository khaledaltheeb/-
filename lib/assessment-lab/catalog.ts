import monitorData from '@/data/assessment-lab/monitors.v1.json';
import instrumentData from '@/data/assessment-lab/instruments.v1.json';

export type AssessmentMonitor = {
  slug: string;
  title: string;
  category: string;
  axes: string[];
};

export type SourceInstrument = {
  slug: string;
  title: string;
  period: string;
  source: string;
  sourceUrl: string;
  status: string;
  note: string;
};

export const assessmentMonitors = monitorData as AssessmentMonitor[];
export const sourceInstruments = instrumentData as SourceInstrument[];
export const assessmentSlugs = [...assessmentMonitors.map((row) => row.slug), ...sourceInstruments.map((row) => row.slug)];
export const assessmentCategories = [...new Set(assessmentMonitors.map((row) => row.category))];

export function getAssessmentMonitor(slug: string) {
  return assessmentMonitors.find((row) => row.slug === slug) ?? null;
}

export function getSourceInstrument(slug: string) {
  return sourceInstruments.find((row) => row.slug === slug) ?? null;
}

export function buildMonitorQuestions(monitor: AssessmentMonitor) {
  return monitor.axes.flatMap((axis) => [
    { axis, text: `${axis}: كان هذا الجانب صعبًا أو أثر في يومي` },
    { axis, text: `${axis}: احتجت إلى دعم إضافي في هذا الجانب` },
    { axis, text: `${axis}: أريد متابعة تغير هذا الجانب` },
  ]);
}
