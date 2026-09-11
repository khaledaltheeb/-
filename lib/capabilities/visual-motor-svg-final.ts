import type { VisualMotorActivity } from './visual-motor-lab';
import { renderVisualMotorWorksheet as renderBase } from './visual-motor-svg';
import { ensureExplicitRtlText } from './kids-lab-svg-polish';

const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]??c));
const rtl=(x:number,y:number,s:string,size=18,weight=600,fill='#475569',anchor='end')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" direction="rtl" unicode-bidi="plaintext" font-family="Arial,Tahoma,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`;
const line=(x1:number,y:number,x2:number)=>`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#94A3B8" stroke-width="1.8"/>`;

function balancedLines(value:string,maxLines:number){
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

function restoreFullInstruction(svg:string,a:VisualMotorActivity){
  const lines=balancedLines(a.instruction,3);
  const longest=Math.max(...lines.map(x=>x.length));
  const size=longest<=45?23:longest<=58?20:18;
  const fresh=lines.map((s,i)=>rtl(1125,211+i*30,s,size,600,'#334155','end')).join('');
  const pattern=/(?:<text x="1125" y="211"[^>]*transform="translate\(0 [^)]+\)"[^>]*>[\s\S]*?<\/text>){1,3}/;
  return svg.replace(pattern,fresh);
}

function normalizePerformanceFooter(svg:string,a:VisualMotorActivity){
  let out=svg;
  out=out.replace(/<text x="1135" y="1630"[^>]*>الاسم: [\s\S]*?<\/text>/,
    `${rtl(1135,1628,'الاسم',17,700)}${line(875,1637,1060)}${rtl(815,1628,'التاريخ',17,700)}${line(650,1637,735)}${rtl(590,1628,'الزمن',17,700)}${line(425,1637,510)}`);
  const obs=balancedLines(a.observation,2);
  const longest=Math.max(...obs.map(x=>x.length));
  const size=longest<=68?16:14.5;
  const obsText=obs.length===1
    ? rtl(1135,1674,obs[0],size,500,'#475569','end')
    : obs.map((s,i)=>rtl(1135,1664+i*27,s,size,500,'#475569','end')).join('');
  out=out.replace(/<text x="1135" y="1671"[^>]*>[\s\S]*?<\/text>/,obsText);
  return out;
}

export function renderVisualMotorWorksheet(a: VisualMotorActivity) {
  const adjusted: VisualMotorActivity = a.kind === 'test' && a.taskType === 'dot-to-dot'
    ? { ...a, seed: a.seed + 1 }
    : a;
  let svg = renderBase(adjusted);
  if (a.kind === 'test' && a.taskType === 'shape-copying') {
    const extra = `<g aria-label="عنصر جديد في نموذج الاختبار"><polygon points="990,620 1020,650 990,680 960,650" fill="none" stroke="#1e3a8a" stroke-width="7"/><circle cx="990" cy="650" r="10" fill="#dbeafe" stroke="#1e3a8a" stroke-width="4"/></g>`;
    svg = svg.replace('<line x1="70" y1="1540"', `${extra}<line x1="70" y1="1540"`);
  }
  svg=restoreFullInstruction(svg,a);
  svg=normalizePerformanceFooter(svg,a);
  return ensureExplicitRtlText(svg);
}
