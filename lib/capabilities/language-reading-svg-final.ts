import type { LanguageReadingActivity } from './language-reading-lab';
import { renderLanguageReadingWorksheet as renderBase } from './language-reading-svg';
import { ensureExplicitRtlText } from './kids-lab-svg-polish';

export function renderLanguageReadingWorksheet(a: LanguageReadingActivity) {
  let svg = renderBase(a);
  if (a.taskType === 'syllable-awareness') {
    svg = svg.replaceAll('</rect>', '');
  }
  return ensureExplicitRtlText(svg);
}
