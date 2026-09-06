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

export function renderExecutiveWorksheet(a: ExecutiveActivity) {
  let svg = renderBase(a);
  if (a.kind === 'test' && a.taskType === 'goal-persistence') {
    for (const [from,to] of replacements) svg = svg.replaceAll(from,to);
  }
  return svg;
}
