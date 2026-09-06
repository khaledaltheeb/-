import type { MathLogicActivity } from './math-logic-lab';
import { renderMathLogicSvg as renderBase } from './math-logic-svg';

export function renderMathLogicSvg(a: MathLogicActivity) {
  if (a.kind !== 'test' || (a.seriesNumber !== 57 && a.seriesNumber !== 58)) return renderBase(a);
  if (a.seriesNumber === 57 && a.level >= 4) return renderBase({ ...a, seed: a.seed + 1 });
  if (a.seriesNumber === 58 && a.level === 4) return renderBase({ ...a, seed: a.seed + 1 });
  return renderBase({ ...a, seed: a.seed + 3001 + a.level * 53 });
}
