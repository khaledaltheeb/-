import type { AttentionActivity } from './attention-lab';
import { renderAttentionWorksheet as renderBase } from './attention-svg';

const esc=(value:string)=>value.replace(/[&<>"']/g,(char)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[char]??char));
const rtl=(x:number,y:number,value:string,size=14,weight=600,fill='#334155',anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Tahoma,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" direction="rtl" unicode-bidi="plaintext">${esc(value)}</text>`;
const line=(x1:number,y:number,x2:number)=>`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#94A3B8" stroke-width="1.5"/>`;

function balancedLines(value:string,maxLines=3){
  const words=value.trim().split(/\s+/).filter(Boolean);
  if(!words.length)return [''];
  const lines:string[]=[];
  let start=0;
  for(let remaining=maxLines;remaining>0&&start<words.length;remaining--){
    const left=words.length-start;
    const take=remaining===1?left:Math.ceil(left/remaining);
    lines.push(words.slice(start,start+take).join(' '));
    start+=take;
  }
  return lines;
}

function normalizeHeader(svg:string,instruction:string){
  const lines=balancedLines(instruction,3);
  const longest=Math.max(...lines.map((x)=>x.length));
  const size=longest<=42?14:longest<=55?12.5:11.5;
  const ys=lines.length===1?[161]:lines.length===2?[151,171]:[145,162,179];
  const replacement=lines.map((text,index)=>rtl(397,ys[index],text,size,500,'#334155')).join('');
  return svg.replace(/<text x="397" y="161"[^>]*>[\s\S]*?<\/text>/,replacement);
}

function normalizeFooter(svg:string){
  let out=svg;
  out=out.replace(/<text x="710" y="1038"[^>]*>الاسم: \.{8,}<\/text>/,`${rtl(710,1037,'الاسم',14,700,'#334155','end')}${line(525,1045,650)}`);
  out=out.replace(/<text x="465" y="1038"[^>]*>التاريخ: \.{5,}<\/text>/,`${rtl(465,1037,'التاريخ',14,700,'#334155','end')}${line(335,1045,405)}`);
  out=out.replace(/<text x="255" y="1038"[^>]*>الأخطاء: \.{5,}<\/text>/,`${rtl(255,1037,'الأخطاء',14,700,'#334155','end')}${line(125,1045,195)}`);
  return out;
}

export function renderAttentionWorksheet(activity:AttentionActivity){
  let svg=renderBase(activity);
  svg=normalizeHeader(svg,activity.instruction);
  return normalizeFooter(svg);
}
