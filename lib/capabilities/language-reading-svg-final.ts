import type { LanguageReadingActivity } from './language-reading-lab';
import { renderLanguageReadingWorksheet as renderBase } from './language-reading-svg';

const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]??c));
const rtl=(x:number,y:number,s:string,size=15,weight=600,fill='#334155',anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" direction="rtl" unicode-bidi="plaintext" font-family="Tahoma,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`;
const ltr=(x:number,y:number,s:string,size=13,weight=500,fill='#64748B',anchor='start')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" direction="ltr" unicode-bidi="plaintext" font-family="Arial,Tahoma,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`;
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

function restoreFullInstruction(svg:string,a:LanguageReadingActivity){
  const lines=balancedLines(a.instruction,3);
  const longest=Math.max(...lines.map(x=>x.length));
  const size=longest<=44?15:longest<=56?13.5:12.5;
  const ys=lines.length===1?[190]:lines.length===2?[179,204]:[171,193,215];
  const fresh=lines.map((s,i)=>rtl(397,ys[i],s,size,600,'#334155')).join('');
  const block=/<rect x="62" y="155" width="670" height="(?:48|66)" rx="16" fill="#F8FAFC" stroke="#E2E8F0"\/>\s*(?:<text x="397" y="(?:185|208)"[\s\S]*?<\/text>){1,2}/;
  return svg.replace(block,`<rect x="62" y="155" width="670" height="74" rx="16" fill="#F8FAFC" stroke="#E2E8F0"/>${fresh}`);
}

function normalizeFooter(svg:string){
  let out=svg;
  out=out.replace(/<text x="60" y="1065"[^>]*>الاسم: ____________\s+التاريخ: ____________\s+الدقة: ____ \/ ____<\/text>/,
    `${rtl(690,1062,'الاسم',14,700,'#475569')}${line(535,1071,645)}${rtl(455,1062,'التاريخ',14,700,'#475569')}${line(330,1071,405)}${rtl(245,1062,'الدقة',14,700,'#475569')}${line(105,1071,195)}`);
  out=out.replace(/<text x="734" y="1095"[^>]*>Health Renewal · مهمة تعليمية غير تشخيصية<\/text>/,
    `${rtl(734,1094,'مهمة تعليمية غير تشخيصية',13,500,'#64748B','end')}${ltr(60,1094,'Health Renewal',13,500,'#64748B','start')}`);
  return out;
}

export function renderLanguageReadingWorksheet(a: LanguageReadingActivity) {
  let svg = renderBase(a);
  // The base syllable cards use self-closing <rect /> tags but still append a legacy </rect>.
  // Strip only those impossible closing tags for this task until the base renderer is normalized.
  if (a.taskType === 'syllable-awareness') svg=svg.replaceAll('</rect>', '');
  svg=restoreFullInstruction(svg,a);
  return normalizeFooter(svg);
}
