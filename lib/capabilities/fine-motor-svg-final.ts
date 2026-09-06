import type { FineMotorActivity } from './fine-motor-lab';
import { renderFineMotorWorksheet as renderBase } from './fine-motor-svg';

export function renderFineMotorWorksheet(a: FineMotorActivity) {
  if (a.kind !== 'test' || (a.seriesNumber !== 40 && a.seriesNumber !== 41)) return renderBase(a);
  return renderBase({ ...a, seed: a.seed + 4001 + a.level * 61 });
}
