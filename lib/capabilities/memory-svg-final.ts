import type { MemoryActivity } from './memory-lab';
import { renderMemoryWorksheet as renderBase } from './memory-svg';
import { ensureExplicitRtlText } from './kids-lab-svg-polish';

export function renderMemoryWorksheet(a: MemoryActivity) {
  return ensureExplicitRtlText(renderBase(a));
}
