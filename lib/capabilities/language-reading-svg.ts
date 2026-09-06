import type { LanguageReadingActivity } from './language-reading-lab';
import { initialSoundBanks, rhymeBanks, syllableBanks, similarLetterGroups } from './language-reading-lab';

const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]||c));
const header=(a:LanguageReadingActivity)=>`<rect width="794" height="1123" fill="#FFFDF8"/><rect x="34" y="30" width="726" height="112" rx="24" fill="#EAF3FF" stroke="#2563EB" stroke-width="2"/><text x="397" y="74" text-anchor="middle" font-family="Arial" font-size="28" font-weight="700" fill="#17324D">${esc(a.seriesTitle)}</text><text x="397" y="112" text-anchor="middle" font-family="Arial" font-size="18" fill="#31506F">المستوى ${a.level} · ${esc(a.label)}</text>`;
const footer=`<line x1="60" y1="1032" x2="734" y2="1032" stroke="#CBD5E1"/><text x="60" y="1065" font-family="Arial" font-size="16" fill="#475569">الاسم: ____________  التاريخ: ____________  الدقة: ____ / ____</text><text x="734" y="1095" text-anchor="end" font-family="Arial" font-size="13" fill="#64748B">Health Renewal · مهمة تعليمية غير تشخيصية</text>`;
const card=(x:number,y:number,w:number,h:number,text:string,sub='')=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#FFFFFF" stroke="#B8C7D9" stroke-width="2"/><text x="${x+w/2}" y="${y+h/2-(sub?10:0)}" text-anchor="middle" font-family="Arial" font-size="${sub?34:40}" font-weight="700" fill="#17324D">${esc(text)}</text>${sub?`<text x="${x+w/2}" y="${y+h/2+26}" text-anchor="middle" font-family="Arial" font-size="18" fill="#475569">${esc(sub)}</text>`:''}`;

function body(a:LanguageReadingActivity){
 const lvl=a.level, seed=a.seed;
 if(a.taskType==='rhyming'){
  const group=rhymeBanks[seed%rhymeBanks.length]; const distract=['قمر','بيت','سمك','شمس','ورد']; const words=[...group.slice(0,Math.min(2+Math.floor(lvl/2),3)),...distract.slice(0,2+lvl)];
  return `<text x="397" y="190" text-anchor="middle" font-family="Arial" font-size="22" fill="#334155">اسمع الكلمات وحدد الكلمات ذات النهاية الصوتية المتشابهة</text>${words.slice(0,6).map((w,i)=>card(85+(i%3)*220,250+Math.floor(i/3)*190,180,130,w)).join('')}`;
 }
 if(a.taskType==='initial-sound'||a.taskType==='letter-picture-match'){
  const bank=initialSoundBanks[seed%initialSoundBanks.length]; const opts=[bank,...initialSoundBanks.filter(b=>b.letter!==bank.letter).slice(0,2+Math.min(lvl,2))];
  return `<text x="397" y="192" text-anchor="middle" font-family="Arial" font-size="22" fill="#334155">${a.taskType==='initial-sound'?'أي الصور تبدأ بالصوت نفسه؟':'صِل الحرف بالصورة التي يبدأ اسمها بصوته'}</text>${card(307,225,180,110,bank.letter,'صوت الهدف')}${opts.flatMap((b,bi)=>b.words.slice(0,lvl<3?1:2).map((w,wi)=>card(75+((bi*2+wi)%3)*225,390+Math.floor((bi*2+wi)/3)*175,185,125,w[1],w[0]))).slice(0,6).join('')}`;
 }
 if(a.taskType==='syllable-awareness'){
  const words=[...syllableBanks.one,...syllableBanks.two,...syllableBanks.three].slice(seed%4,seed%4+Math.min(6,3+lvl));
  return `<text x="397" y="190" text-anchor="middle" font-family="Arial" font-size="22" fill="#334155">انطق بالفصحى ثم صفّق/انقر لكل مقطع</text>${words.map((w,i)=>card(90+(i%2)*340,260+Math.floor(i/2)*170,280,115,w,'○ ○ ○')).join('')}`;
 }
 if(a.taskType==='letter-discrimination'){
  const g=similarLetterGroups[seed%similarLetterGroups.length]; const target=g[seed%g.length]; const row=Array.from({length:18+lvl*3},(_,i)=>i%(5+lvl)===0?target:g[(i+1)%g.length]);
  return `<text x="397" y="190" text-anchor="middle" font-family="Arial" font-size="22" fill="#334155">ضع دائرة حول الحرف: ${target}</text>${row.map((ch,i)=>`<text x="${90+(i%7)*95}" y="${285+Math.floor(i/7)*100}" text-anchor="middle" font-family="Arial" font-size="42" fill="#17324D">${ch}</text>`).join('')}`;
 }
 const steps=['استيقظ الطفل','غسل وجهه','ارتدى ملابسه','تناول الإفطار','حمل حقيبته','ذهب إلى المدرسة']; const n=Math.min(6,2+lvl); return `<text x="397" y="190" text-anchor="middle" font-family="Arial" font-size="22" fill="#334155">رتّب الأحداث من الأول إلى الأخير</text>${steps.slice(0,n).map((s,i)=>card(90+(i%2)*340,260+Math.floor(i/2)*170,280,115,String.fromCodePoint(0x2460+((i+seed)%n)),s)).join('')}`;
}
export function renderLanguageReadingWorksheet(a:LanguageReadingActivity){return `<svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123" viewBox="0 0 794 1123" direction="rtl">${header(a)}${body(a)}${footer}</svg>`;}
