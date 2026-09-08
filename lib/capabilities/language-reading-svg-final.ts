import type { LanguageReadingActivity } from './language-reading-lab';
import { renderLanguageReadingWorksheet as renderBase } from './language-reading-svg';

export function renderLanguageReadingWorksheet(a: LanguageReadingActivity) {
  return renderBase(a);
}
