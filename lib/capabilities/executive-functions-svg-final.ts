import type { ExecutiveActivity } from './executive-functions-lab';
import { renderExecutiveWorksheet as renderBase } from './executive-functions-svg';

const replacements: Array<[string,string]> = [
  ['ضع دائرة حول النجمة','ضع مربعًا حول الدائرة'],
  ['أكمل النمط','أكمل نمطًا جديدًا'],
  ['اكتب عدد المثلثات','اكتب عدد الدوائر'],
  ['صل النقاط المتشابهة','صل الأشكال المتطابقة'],
  ['اشطب الدائرة الحمراء','اشطب المثلث الأزرق'],
  ['ارسم سهمًا للأعلى','ارسم سهمًا لليسار'],
  ['راجع المحطة السابقة','راجع المحطتين السابقتين'],
  ['اختر الشكل الأكبر','اختر الشكل الأصغر'],
];

function polishStepOrdering(svg: string, a: ExecutiveActivity) {
  let out = svg;
  // Base generator uses base.slice(-distr). When distr === 0, slice(-0) is slice(0),
  // which duplicated the full seven-step sequence in level 1. Keep the intended first four cards only.
  if (a.level === 1) {
    for (const y of [570, 690, 810, 930]) {
      const card = new RegExp(`<rect x="(?:68|423)" y="${y}" width="315" height="92"[^>]*/><circle[^>]*/><text[^>]*>[^<]*</text>`, 'g');
      out = out.replace(card, '');
    }
  }
  // Level 5 legitimately has five card rows; move the reflection box below them while
  // retaining a safe gap before the common footer at y=1013.
  if (a.level === 5) {
    out = out.replace('x="68" y="880" width="670" height="80"', 'x="68" y="920" width="670" height="80"');
    out = out.replace('y="914"', 'y="954"');
  }
  return out;
}

export function renderExecutiveWorksheet(a: ExecutiveActivity) {
  let svg = renderBase(a);
  if (a.kind === 'test' && a.taskType === 'goal-persistence') {
    for (const [from,to] of replacements) svg = svg.replaceAll(from,to);
  }
  if (a.taskType === 'step-ordering') svg = polishStepOrdering(svg, a);
  return svg;
}
