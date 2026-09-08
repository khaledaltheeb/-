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

const rtl = (x:number,y:number,label:string,size=14,weight=600,fill='#5E7184',anchor='end') =>
  `<text x="${x}" y="${y}" font-family="Tahoma,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" direction="rtl" unicode-bidi="plaintext">${label}</text>`;
const answerLine = (x1:number,y:number,x2:number) =>
  `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#94A3B8" stroke-width="1.5"/>`;

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

function normalizeResponseFields(svg: string, a: ExecutiveActivity) {
  let out = svg;

  out = out.replace(
    /<text\b[^>]*y="1074"[^>]*>الدقة: ____ \/ ____\s+التلميحات: ____\s+التصحيح الذاتي: ____<\/text>/,
    `${rtl(730,1072,'الدقة',14,700)}${answerLine(570,1078,665)}${rtl(520,1072,'التلميحات',14,700)}${answerLine(365,1078,455)}${rtl(320,1072,'التصحيح الذاتي',14,700)}${answerLine(110,1078,225)}`
  );

  if (a.taskType === 'task-initiation') {
    out = out.replace(
      /<text\b[^>]*y="1100"[^>]*>زمن البدء: ____ ثانية\s+ملاحظة: ____________________<\/text>/,
      `${rtl(730,1098,'زمن البدء (ثانية)',13,600)}${answerLine(540,1104,650)}${rtl(480,1098,'ملاحظة',13,600)}${answerLine(95,1104,405)}`
    );
  } else {
    out = out.replace(
      /<text\b[^>]*y="1100"[^>]*>ملاحظة قصيرة: __________________________________________<\/text>/,
      `${rtl(730,1098,'ملاحظة قصيرة',13,600)}${answerLine(95,1104,590)}`
    );
  }

  out = out.replace(
    /<text\b[^>]*y="900"[^>]*>قبل التنفيذ: اكتب عدد الخطوات المتوقع: ____<\/text>/,
    `${rtl(730,900,'قبل التنفيذ: عدد الخطوات المتوقع',16,700)}${answerLine(185,910,475)}`
  );
  out = out.replace(
    /<text\b[^>]*y="932"[^>]*>زمن البدء بعد الإشارة: ______ ثانية<\/text>/,
    `${rtl(715,932,'زمن البدء بعد الإشارة (ثانية)',17,800,'#16A34A')}${answerLine(185,942,455)}`
  );
  out = out.replace(
    /<text\b[^>]*y="958"[^>]*>ما أول شيء سأفعله خلال 60 ثانية\؟ __________________________<\/text>/,
    `${rtl(715,958,'ما أول شيء سأفعله خلال 60 ثانية؟',14,700)}${answerLine(145,970,455)}`
  );
  out = out.replace(
    /<text\b[^>]*y="654"[^>]*>قاعدتي هي: ______________________________________________<\/text>/,
    `${rtl(715,654,'قاعدتي هي',16,800,'#17324D')}${answerLine(120,666,575)}`
  );

  return out;
}

export function renderExecutiveWorksheet(a: ExecutiveActivity) {
  let svg = renderBase(a);
  if (a.kind === 'test' && a.taskType === 'goal-persistence') {
    for (const [from,to] of replacements) svg = svg.replaceAll(from,to);
  }
  if (a.taskType === 'step-ordering') svg = polishStepOrdering(svg, a);
  return normalizeResponseFields(svg, a);
}
