import type { EmotionalRegulationActivity } from './emotional-regulation-lab';
import { renderEmotionalRegulationSvg as renderBase } from './emotional-regulation-svg';

export function renderEmotionalRegulationSvg(a: EmotionalRegulationActivity) {
  return renderBase(a);
}
