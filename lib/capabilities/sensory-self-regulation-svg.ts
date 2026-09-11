import type { SensorySelfActivity } from './sensory-self-regulation-lab';
import { energySteps, readinessActions, whatHelpsScenarios } from './sensory-self-regulation-lab';

const INK='#0f172a',MUTED='#475569',LINE='#cbd5e1',TEAL='#0f766e';
const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const wrap=(s:string,n=42)=>{const words=s.split(/\s+/),out:string[]=[];let line='';for(const word of words){const next=(line+' '+word).trim();if(next.length>n&&line){out.push(line);line=word}else line=next}if(line)out.push(line);return out};
const rtl=(x:number,y:number,s:string,size=18,weight=600,fill=INK,anchor:'start'|'middle'|'end'='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" direction="rtl" unicode-bidi="plaintext" font-size="${size}" font-weight="${weight}" font-family="Tahoma,Arial,sans-serif" fill="${fill}">${esc(s)}</text>`;
const line=(x1:number,y:number,x2:number)=>`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#94a3b8" stroke-width="1.7"/>`;
const textBlock=(text:string,x:number,y:number,size=22,maxChars=42,widthLines=3,anchor:'start'|'middle'|'end'='middle')=>{
 const lines=wrap(text,maxChars);
 const safeSize=lines.length>widthLines?Math.max(15,size-3):size;
 const shown=lines.slice(0,Math.max(widthLines,lines.length));
 return shown.map((l,i)=>rtl(x,y+i*(safeSize+8),l,safeSize,500,INK,anchor)).join('');
};
const check=(x:number,y:number,label:string,w=150)=>`<g><rect x="${x}" y="${y}" width="${w}" height="38" rx="11" fill="#fff" stroke="${LINE}"/><rect x="${x+w-28}" y="${y+10}" width="16" height="16" rx="3" fill="#fff" stroke="${TEAL}"/>${rtl(x+w-36,y+25,label,13,600,INK,'start')}</g>`;
const answer=(label:string,y:number,xRight=680,x1=130,x2=545)=>`${rtl(xRight,y,label,15,700,INK,'start')}${line(x1,y+10,x2)}`;

const shell=(a:SensorySelfActivity,body:string)=>`<svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123" viewBox="0 0 794 1123" role="img" aria-label="${esc(a.title)}"><rect width="794" height="1123" fill="#ffffff"/><rect x="28" y="24" width="738" height="102" rx="20" fill="#ecfeff" stroke="${TEAL}" stroke-width="2"/>${rtl(397,62,a.seriesTitle,28,800,'#115e59')}${rtl(397,96,`المستوى ${a.level} · ${a.label} · ${a.age}`,19,500,'#334155')}${body}<rect x="36" y="1025" width="722" height="66" rx="16" fill="#f8fafc" stroke="${LINE}"/>${rtl(397,1053,'لا توجد استجابة شخصية واحدة صحيحة للجميع · اختر ما يناسبك وراجع النتيجة',15,500,'#334155')}${rtl(397,1079,'أداة تعليمية للملاحظة الذاتية وليست تقييمًا سريريًا أو وصفة حسية',14,500,'#64748b')}</svg>`;

function helps(a:SensorySelfActivity){
 const sc=whatHelpsScenarios[(a.seed+a.level)%whatHelpsScenarios.length];
 const opts=a.kind==='test'?[...sc.options].reverse():[...sc.options];
 const showOptions=a.kind!=='test'||a.level<=2;
 let b=`${rtl(397,170,sc.title,26,800)}${textBlock(sc.goal,397,210,20,46,3)}`;
 b+=rtl(397,294,a.level<=2?'ضع علامة على ما قد يساعدك، ويمكنك اختيار أكثر من خيار.':'ما هدفك؟ اختر دعمًا مناسبًا لهذا الموقف، ثم فسّر لماذا.',19,500,MUTED);
 if(showOptions){
  opts.forEach((o,i)=>{const y=350+i*112;b+=`<rect x="110" y="${y}" width="574" height="82" rx="18" fill="${i%2?'#f0fdfa':'#f8fafc'}" stroke="#94a3b8" stroke-width="2"/><circle cx="145" cy="${y+41}" r="16" fill="#fff" stroke="${TEAL}" stroke-width="3"/>${textBlock(o,650,y+31,18,34,3,'start')}`});
 }else{
  b+=`<rect x="110" y="350" width="574" height="360" rx="20" fill="#fff" stroke="${LINE}"/>${answer('الخيار 1',405,650,160,545)}${answer('الخيار 2',475,650,160,545)}${a.level>=4?answer('بديل إذا لم يساعد',545,650,160,510):''}${a.level===5?answer('كيف ستعرف أنه ساعد؟',615,650,160,480):''}`;
 }
 const y=showOptions?855:780;
 b+=`${rtl(397,y,'لماذا اخترت هذا؟',21,800,'#115e59')}<rect x="100" y="${y+25}" width="594" height="${a.level>=4?120:90}" rx="16" fill="#fff" stroke="${LINE}" stroke-width="2"/>`;
 if(a.level===5)b+=rtl(397,960,'إذا لم يساعد، غيّر الخطة بدل افتراض أن المشكلة فيك.',15,600,'#64748b');
 return shell(a,b);
}

function energy(a:SensorySelfActivity){
 const task=['قراءة هادئة','الاستعداد للخروج','حل تمرين قصير','الجلوس في مجموعة','الانتقال لنشاط جديد'][(a.seed+a.level)%5];
 const showNotes=a.kind!=='test'&&a.level<=2;
 let b=`${rtl(397,170,`المهمة الآن: ${task}`,24,800)}${rtl(397,212,a.level<=2?'أي وصف أقرب لطاقتك بالنسبة لهذه المهمة؟':'صف طاقتك بالنسبة للمهمة، ثم اختر خطوة واختبر أثرها.',19,500,MUTED)}`;
 energySteps.forEach((s,i)=>{const x=155+i*242;b+=`<rect x="${x-94}" y="270" width="188" height="178" rx="24" fill="${i===0?'#eff6ff':i===1?'#ecfdf5':'#fff7ed'}" stroke="#64748b" stroke-width="2"/>${rtl(x,328,s.symbol,42,700)}${textBlock(s.label,x,370,17,17,3)}${showNotes?textBlock(s.note,x,414,11,22,3):''}`});
 b+=rtl(397,505,a.level>=3?'اختر خطوة، جرّبها، ثم أعد التقييم':'اختر خطوة واحدة آمنة ثم أعد التقييم',20,800,'#115e59');
 const actionCount=a.level<=2?5:a.level<=4?4:3;
 readinessActions.slice(a.seed%3,(a.seed%3)+actionCount).forEach((o,i)=>{const y=548+i*70;b+=`<rect x="130" y="${y}" width="534" height="50" rx="14" fill="#f8fafc" stroke="${LINE}"/><circle cx="160" cy="${y+25}" r="12" fill="#fff" stroke="${TEAL}" stroke-width="2"/>${rtl(630,y+32,o,17,500,INK,'start')}`});
 const y2=548+actionCount*70+35;
 b+=`${rtl(397,y2,'بعد التجربة: هل ساعدت؟',19,800,'#115e59')}${check(447,y2+18,'نعم',100)}${check(337,y2+18,'قليلًا',100)}${check(227,y2+18,'لا',100)}${answer(a.level>=4?'ما الذي ستغيّره في الخطة التالية؟':'ماذا ستفعل الآن؟',y2+105,680,130,480)}`;
 if(a.level===5)b+=rtl(397,y2+160,'ميّز بين الطاقة والانفعال والجوع والعطش والتعب قبل اختيار الخطة.',14,600,'#64748b');
 return shell(a,b);
}

export function renderSensorySelfSvg(a:SensorySelfActivity){return a.taskType==='what-helps-me'?helps(a):energy(a)}
