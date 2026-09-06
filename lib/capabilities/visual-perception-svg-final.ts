import type { VisualPerceptionActivity } from './visual-perception-lab';
import { renderVisualPerceptionWorksheet as renderBase } from './visual-perception-svg';

const needsIndependentStimulus = new Set(['visual-discrimination','form-constancy','mental-rotation']);

export function renderVisualPerceptionWorksheet(a: VisualPerceptionActivity) {
  if (a.kind !== 'test' || !needsIndependentStimulus.has(a.taskType)) return renderBase(a);
  const adjusted: VisualPerceptionActivity = {
    ...a,
    seed: a.seed + 1009 + a.level * 37,
    variant: (a.variant + 3 + a.level) % 11,
  };
  return renderBase(adjusted);
}
