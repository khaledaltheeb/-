import type { LanguageReadingActivity } from './language-reading-lab';
import { renderLanguageReadingWorksheet as renderBase } from './language-reading-svg';

export function renderLanguageReadingWorksheet(a: LanguageReadingActivity) {
  const svg = renderBase(a);
  // The base syllable cards use self-closing <rect /> tags but still append a legacy </rect>.
  // Strip only those impossible closing tags for this task until the base renderer is normalized.
  return a.taskType === 'syllable-awareness' ? svg.replaceAll('</rect>', '') : svg;
}
