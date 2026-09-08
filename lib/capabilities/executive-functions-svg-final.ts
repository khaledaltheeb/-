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

const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]??c));
const rtl = (x:number,y:number,label:string,size=14,weight=600,fill='#5E7184',anchor='end') =>
  `<text x="${x}" y="${y}" font-family="Tahoma,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" direction="rtl" unicode-bidi="plaintext">${esc(label)}</text>`;
const answerLine = (x1:number,y:number,x2:number) =>
  `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#94A3B8" stroke-width="1.5"/>`;

function balancedLines(value:string,maxLines=3){
  const words=value.trim().split(/\s+/).filter(Boolean);
  if(!words.length)return [''];
  const lines:string[]=[];let start=0;
  for(let remaining=maxLines;remaining>0&&start<words.length;remaining--){
    const left=words.length-start;
    const take=remaining===1?left:Math.ceil(left/remaining);
    lines.push(words.slice(start,start+take).join(' '));start+=take;
  }
  return lines;
}

function normalizeInstruction(svg:string,a:ExecutiveActivity){
  const lines=balancedLines(a.instruction,3);
  const longest=Math.max(...lines.map(x=>x.length));
  const size=longest<=44?17:longest<=58?15:13.5;
  const boxHeight=lines.length===1?76:lines.length===2?82:94;
  const y0=lines.length===1?204:lines.length===2?194:188;
  const fresh=lines.map((s,i)=>rtl(730,y0+i*23,s,size,700,'#FFF','end')).join('');
  let out=svg.replace(/<rect x="30" y="160" width="734" height="76" rx="20" fill="(?:#7C3AED|#2563EB)"\/>/,match=>match.replace('height="76"',`height="${boxHeight}"`));
  out=out.replace(/(?:<text x="730" y="(?:192|217)"[^>]*>[\s\S]*?<\/text>){1,2}/,fresh);
  return out;
}

function polishStepOrdering(svg: string, a: ExecutiveActivity) {
  let out = svg;
  if (a.level === 1) {
    for (const y of [570, 690, 810, 930]) {
      const card = new RegExp(`<rect x="(?:68|423)" y="${y}" width="315" height="92"[^>]*/><circle[^>]*/><text[^>]*>[^<]*</text>`, 'g');
      out = out.replace(card, '');
    }
  }
  if (a.level === 5) {
    out = out.replace('x="68" y="880" width="670" height="80"', 'x="68" y="920" width="670" height="80"');
    out = out.replace('y="914"', 'y="954"');
  }
  return out;
}

function normalizeResponseFields(svg: string, a: ExecutiveActivity) {
  let out = svg;
  out = out.replace(/<text\b[^>]*y="1074"[^>]*>الدقة: ____ \/ ____\s+التلميحات: ____\s+التصحيح الذاتي: ____<\/text>/,`${rtl(730,1072,'الدقة',14,700)}${answerLine(570,1078,665)}${rtl(520,1072,'التلميحات',14,700)}${answerLine(365,1078,455)}${rtl(320,1072,'التصحيح الذاتي',14,700)}${answerLine(110,1078,225)}`);
  if (a.taskType === 'task-initiation') {
    out = out.replace(/<text\b[^>]*y="1100"[^>]*>زمن البدء: ____ ثانية\s+ملاحظة: ____________________<\/text>/,`${rtl(730,1098,'زمن البدء (ثانية)',13,600)}${answerLine(540,1104,650)}${rtl(480,1098,'ملاحظة',13,600)}${answerLine(95,1104,405)}`);
  } else {
    out = out.replace(/<text\b[^>]*y="1100"[^>]*>ملاحظة قصيرة: __________________________________________<\/text>/,`${rtl(730,1098,'ملاحظة قصيرة',13,600)}${answerLine(95,1104,590)}`);
  }
  out = out.replace(/<text\b[^>]*y="900"[^>]*>قبل التنفيذ: اكتب عدد الخطوات المتوقع: ____<\/text>/,`${rtl(730,900,'قبل التنفيذ: عدد الخطوات المتوقع',16,700)}${answerLine(185,910,475)}`);
  out = out.replace(/<text\b[^>]*y="932"[^>]*>زمن البدء بعد الإشارة: ______ ثانية<\/text>/,`${rtl(715,932,'زمن البدء بعد الإشارة (ثانية)',17,800,'#16A34A')}${answerLine(185,942,455)}`);
  out = out.replace(/<text\b[^>]*y="958"[^>]*>ما أول شيء سأفعله خلال 60 ثانية\؟ __________________________<\/text>/,`${rtl(715,958,'ما أول شيء سأفعله خلال 60 ثانية؟',14,700)}${answerLine(145,970,455)}`);
  out = out.replace(/<text\b[^>]*y="654"[^>]*>قاعدتي هي: ______________________________________________<\/text>/,`${rtl(715,654,'قاعدتي هي',16,800,'#17324D')}${answerLine(120,666,575)}`);
  return out;
}

export function renderExecutiveWorksheet(a: ExecutiveActivity) {
  let svg = renderBase(a);
  if (a.kind === 'test' && a.taskType === 'goal-persistence') {
    for (const [from,to] of replacements) svg = svg.replaceAll(from,to);
  }
  if (a.taskType === 'step-ordering') svg = polishStepOrdering(svg, a);
  svg=normalizeInstruction(svg,a);
  return normalizeResponseFields(svg, a);
}
