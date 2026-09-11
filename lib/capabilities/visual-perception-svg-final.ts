import type { VisualPerceptionActivity } from './visual-perception-lab';
import { renderVisualPerceptionWorksheet as renderBase } from './visual-perception-svg';

const needsIndependentStimulus = new Set(['visual-discrimination','form-constancy','mental-rotation']);
const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]??c));
const rtl=(x:number,y:number,s:string,size=14,weight=600,fill='#334155',anchor='end')=>`<text x="${x}" y="${y}" font-family="Tahoma,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" direction="rtl" unicode-bidi="plaintext">${esc(s)}</text>`;
const line=(x1:number,y:number,x2:number)=>`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#94A3B8" stroke-width="1.5"/>`;

function balancedLines(value:string,maxLines=3){
  const words=value.trim().split(/\s+/).filter(Boolean);
  if(!words.length)return [''];
  const lines:string[]=[];let start=0;
  for(let remaining=maxLines;remaining>0&&start<words.length;remaining--){
    const left=words.length-start;
    const take=remaining===1?left:Math.ceil(left/remaining);
    lines.push(words.slice(start,start+take).join(' '));
    start+=take;
  }
  return lines;
}

function rotateStimulusPalette(svg:string){
  const map:Record<string,string>={'#2563EB':'__C1__','#EC4899':'__C2__','#F59E0B':'__C3__','#10B981':'__C4__','#8B5CF6':'__C5__','#06B6D4':'__C6__','#EF4444':'__C7__'};
  for(const [from,tmp] of Object.entries(map)) svg=svg.replaceAll(from,tmp);
  const rotated=['#06B6D4','#8B5CF6','#10B981','#F59E0B','#EC4899','#EF4444','#2563EB'];
  Object.values(map).forEach((tmp,i)=>{svg=svg.replaceAll(tmp,rotated[i]);});
  return svg;
}

function normalizeInstruction(svg:string,a:VisualPerceptionActivity){
  const lines=balancedLines(a.instruction,3);
  const longest=Math.max(...lines.map(x=>x.length));
  const size=longest<=42?20:longest<=56?17:15;
  const boxHeight=lines.length===1?62:lines.length===2?82:104;
  const y0=lines.length===1?168:lines.length===2?164:158;
  const fresh=lines.map((s,i)=>rtl(397,y0+i*27,s,size,600,'#FFFFFF','middle')).join('');
  let out=svg.replace(/<rect x="28" y="130" width="738" height="(?:62|82)" rx="20" fill="#2563EB"\/>/,`<rect x="28" y="130" width="738" height="${boxHeight}" rx="20" fill="#2563EB"/>`);
  out=out.replace(/(?:<text x="397" y="(?:168|198)"[\s\S]*?<\/text>){1,2}/,fresh);
  return out;
}

function normalizeFooter(svg:string){
  let out=svg;
  out=out.replace(/<text\b[^>]*y="1048"[^>]*>الاسم: __________________<\/text>/,`${rtl(740,1046,'الاسم',14,700)}${line(530,1054,675)}`);
  out=out.replace(/<text\b[^>]*y="1048"[^>]*>التاريخ: __________<\/text>/,`${rtl(470,1046,'التاريخ',14,700)}${line(340,1054,405)}`);
  out=out.replace(/<text\b[^>]*y="1048"[^>]*>صحيح: ____<\/text>/,`${rtl(260,1046,'صحيح',14,700)}${line(190,1054,225)}`);
  out=out.replace(/<text\b[^>]*y="1048"[^>]*>تلميحات: ____<\/text>/,`${rtl(120,1046,'تلميحات',14,700)}${line(42,1054,82)}`);
  return out;
}

export function renderVisualPerceptionWorksheet(a: VisualPerceptionActivity) {
  let svg: string;
  if (a.kind !== 'test' || !needsIndependentStimulus.has(a.taskType)) {
    svg=renderBase(a);
  } else if (a.taskType === 'visual-discrimination' && (a.level === 1 || a.level === 4)) {
    svg=rotateStimulusPalette(renderBase({ ...a, seed: a.seed + 1, variant: (a.variant + 1) % 7 }));
  } else {
    const adjusted: VisualPerceptionActivity = {
      ...a,
      seed: a.seed + 1009 + a.level * 37,
      variant: (a.variant + 3 + a.level) % 11,
    };
    svg=renderBase(adjusted);
  }
  svg=normalizeInstruction(svg,a);
  return normalizeFooter(svg);
}
