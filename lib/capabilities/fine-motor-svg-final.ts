import type { FineMotorActivity } from './fine-motor-lab';
import { renderFineMotorWorksheet as renderBase } from './fine-motor-svg';

const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]??c));
const rtl=(x:number,y:number,s:string,size=15,weight=600,fill='#334155',anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" direction="rtl" unicode-bidi="plaintext" font-family="Tahoma,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`;

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

function restoreFullInstruction(svg:string,a:FineMotorActivity){
  const lines=balancedLines(a.instruction,3);
  const longest=Math.max(...lines.map(x=>x.length));
  const size=longest<=42?15:longest<=54?13.5:12.5;
  const ys=lines.length===1?[179]:lines.length===2?[169,193]:[163,184,205];
  const fresh=lines.map((s,i)=>rtl(397,ys[i],s,size,600,'#334155')).join('');
  const block=/<rect x="72" y="145" width="650" height="(?:48|62)" rx="16" fill="#F8FAFC" stroke="#E2E8F0"\/>\s*(?:<text x="397" y="(?:163|188)"[\s\S]*?<\/text>){1,2}/;
  return svg.replace(block,`<rect x="72" y="145" width="650" height="74" rx="16" fill="#F8FAFC" stroke="#E2E8F0"/>${fresh}`);
}

export function renderFineMotorWorksheet(a: FineMotorActivity) {
  const adjusted=a.kind === 'test' && (a.seriesNumber === 40 || a.seriesNumber === 41)
    ? { ...a, seed: a.seed + 4001 + a.level * 61 }
    : a;
  return restoreFullInstruction(renderBase(adjusted),a);
}
