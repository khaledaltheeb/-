import type { VisualMotorActivity } from './visual-motor-lab';
import { renderVisualMotorWorksheet as renderBase } from './visual-motor-svg';

export function renderVisualMotorWorksheet(a: VisualMotorActivity) {
  const adjusted: VisualMotorActivity = a.kind === 'test' && a.taskType === 'dot-to-dot'
    ? { ...a, seed: a.seed + 1 }
    : a;
  let svg = renderBase(adjusted);
  if (a.kind === 'test' && a.taskType === 'shape-copying') {
    const extra = `<g aria-label="عنصر جديد في نموذج الاختبار"><polygon points="990,620 1020,650 990,680 960,650" fill="none" stroke="#1e3a8a" stroke-width="7"/><circle cx="990" cy="650" r="10" fill="#dbeafe" stroke="#1e3a8a" stroke-width="4"/></g>`;
    svg = svg.replace('<line x1="70" y1="1540"', `${extra}<line x1="70" y1="1540"`);
  }
  return svg;
}
