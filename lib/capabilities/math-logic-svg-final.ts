import type { MathLogicActivity } from './math-logic-lab';
import { renderMathLogicSvg as renderBase } from './math-logic-svg';

const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]??c));
const rtl=(x:number,y:number,s:string,size=17,weight=700,fill='#334155',anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" direction="rtl" unicode-bidi="plaintext" font-family="Tahoma,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`;
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

function restoreFullInstruction(svg:string,a:MathLogicActivity){
  const lines=balancedLines(a.instruction,3);
  const longest=Math.max(...lines.map(x=>x.length));
  const size=longest<=46?16:longest<=58?14:12.5;
  const ys=lines.length===1?[187]:lines.length===2?[176,201]:[169,191,213];
  const fresh=lines.map((s,i)=>rtl(710,ys[i],s,size,600,'#334155','end')).join('');
  const block=/<rect x="55" y="153" width="684" height="(?:50|68)" rx="16" fill="#FFF" stroke="#E2E8F0"\/>\s*(?:<text x="710" y="(?:184|208)"[\s\S]*?<\/text>){1,2}/;
  return svg.replace(block,`<rect x="55" y="153" width="684" height="74" rx="16" fill="#FFF" stroke="#E2E8F0"/>${fresh}`);
}

function normalizeMathResponseFields(svg:string){
  let out=svg;
  out=out.replace(/<text\b[^>]*>الاسم: __________\s+التاريخ: __________<\/text>/,`${rtl(735,1062,'الاسم',14,700,'#475569','end')}${line(535,1070,675)}${rtl(490,1062,'التاريخ',14,700,'#475569','end')}${line(325,1070,430)}`);
  out=out.replace(/<text\b[^>]*>العنصر المفقود = ______<\/text>/,`${rtl(397,652,'العنصر المفقود',20,800,'#0F172A')}${line(290,672,505)}`);
  out=out.replace(/<text\b[^>]*>ما القاعدة التي اكتشفتها\؟ ____________________<\/text>/,`${rtl(397,710,'ما القاعدة التي اكتشفتها؟',17,600,'#475569')}${line(225,732,570)}`);
  return out;
}

export function renderMathLogicSvg(a: MathLogicActivity) {
  let svg:string;
  if (a.kind !== 'test' || (a.seriesNumber !== 57 && a.seriesNumber !== 58)) {
    svg=renderBase(a);
  } else if (a.seriesNumber === 57 && a.level >= 4) {
    svg=renderBase({ ...a, seed: a.seed + 1 });
    const label=a.level===4
      ? 'بعد الإدراج: العدد الذي سيأتي بعد البطاقة الجديدة'
      : 'بعد إكمال الفراغ: العنصر السابق له أيضًا';
    const prompt=`${rtl(397,892,label,16,700,'#334155')}${line(270,914,525)}`;
    svg=svg.replace('<line x1="42" y1="1032"',`${prompt}<line x1="42" y1="1032"`);
  } else if (a.seriesNumber === 58 && a.level === 4) {
    svg=renderBase({ ...a, seed: a.seed + 1 });
  } else {
    svg=renderBase({ ...a, seed: a.seed + 3001 + a.level * 53 });
  }
  svg=restoreFullInstruction(svg,a);
  return normalizeMathResponseFields(svg);
}
