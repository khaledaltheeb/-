import type { MemoryActivity } from './memory-lab';
import { renderMemoryWorksheet as renderBase } from './memory-svg';
import { ensureExplicitRtlText } from './kids-lab-svg-polish';

const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]??c));
const rtl=(x:number,y:number,s:string,size=13,weight=700,fill='#334155',anchor='end')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" direction="rtl" unicode-bidi="plaintext" font-family="Tahoma,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`;
const line=(x1:number,y:number,x2:number)=>`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#94A3B8" stroke-width="1.4"/>`;

function balancedLines(value:string,maxLines=2){
  const words=value.trim().split(/\s+/).filter(Boolean);
  if(!words.length)return [''];
  const lines:string[]=[];
  let start=0;
  for(let remaining=maxLines;remaining>0&&start<words.length;remaining--){
    const wordsLeft=words.length-start;
    const take=remaining===1?wordsLeft:Math.ceil(wordsLeft/remaining);
    lines.push(words.slice(start,start+take).join(' '));
    start+=take;
  }
  return lines;
}

function restoreFullInstruction(svg:string,a:MemoryActivity){
  const lines=balancedLines(a.instruction,2);
  const longest=Math.max(...lines.map(x=>x.length));
  const size=longest<=48?13.5:longest<=60?12.5:11.5;
  const textSvg=lines.length===1
    ? rtl(397,245,lines[0],size,700,'#1E3A8A','middle')
    : lines.map((s,i)=>rtl(397,235+i*22,s,size,700,'#1E3A8A','middle')).join('');
  const pattern=/(<rect x="62" y="208" width="670" height="64"[^>]*\/>)(?:<text x="397" y="(?:245|235|257)"[^>]*>[\s\S]*?<\/text>){1,2}/;
  return svg.replace(pattern,`$1${textSvg}`);
}

function normalizeFooter(svg:string,a:MemoryActivity){
  let out=svg;
  out=out.replace(/<text x="725" y="1027"[^>]*>الاسم: \.{8,}<\/text>/,`${rtl(725,1026,'الاسم')}${line(548,1034,670)}`);
  out=out.replace(/<text x="495" y="1027"[^>]*>التاريخ: \.{5,}<\/text>/,`${rtl(495,1026,'التاريخ')}${line(365,1034,438)}`);
  out=out.replace(/<text x="300" y="1027"[^>]*>صحيح: \.{2,} \/ [^<]+<\/text>/,`${rtl(300,1026,`صحيح من ${a.itemCount}`)}${line(190,1034,240)}`);
  out=out.replace(/<text x="135" y="1027"[^>]*>التلميحات: \.{2,}<\/text>/,`${rtl(160,1026,'التلميحات')}${line(60,1034,110)}`);
  return out;
}

export function renderMemoryWorksheet(a: MemoryActivity) {
  let svg=renderBase(a);
  svg=restoreFullInstruction(svg,a);
  svg=normalizeFooter(svg,a);
  return ensureExplicitRtlText(svg);
}
