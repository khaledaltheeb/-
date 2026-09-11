import type { SocialActivity } from './social-skills-lab';
import { perspectiveScenarios, problemScenarios, socialCueScenarios } from './social-skills-lab';

const W=794,H=1123,INK='#0F172A',MUTED='#64748B',LINE='#CBD5E1',GREEN='#65A30D';
const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const wrap=(text:string,max=38)=>{const words=text.split(/\s+/);const lines:string[]=[];let line='';for(const word of words){const next=(line+' '+word).trim();if(next.length>max&&line){lines.push(line);line=word}else line=next}if(line)lines.push(line);return lines;};
const rtl=(x:number,y:number,s:string,size=18,weight=600,fill=INK,anchor:'start'|'middle'|'end'='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" direction="rtl" unicode-bidi="plaintext" font-family="Tahoma,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`;
const textBlock=(text:string,x:number,y:number,size=24,max=38,anchor:'start'|'middle'|'end'='middle',maxLines=3)=>{let font=size,chars=max,lines=wrap(text,chars);while(lines.length>maxLines&&font>14){font-=2;chars+=6;lines=wrap(text,chars)}return lines.map((line,i)=>rtl(x,y+i*(font+7),line,font,500,INK,anchor)).join('');};
const answerLine=(label:string,y:number,index?:number)=>`${rtl(650,y,index?`${index}) ${label}`:label,17,600,MUTED,'start')}<line x1="145" y1="${y+10}" x2="520" y2="${y+10}" stroke="#94A3B8" stroke-width="2"/>`;
const header=(a:SocialActivity)=>`<rect width="794" height="1123" fill="#FFFEFB"/><rect x="34" y="28" width="726" height="122" rx="26" fill="#F0FDF4" stroke="#84CC16" stroke-width="2"/>${rtl(397,74,a.seriesTitle,28,800,'#365314')}${rtl(397,111,`المستوى ${a.level} · ${a.label}`,20,500,'#3F6212')}`;
const footer=`<line x1="42" y1="1030" x2="752" y2="1030" stroke="#CBD5E1"/>${rtl(397,1064,'روافد | مهمة تعلم وملاحظة، وليست أداة تشخيص معيارية',16,500,'#475569')}`;

function cue(a:SocialActivity){
 const s=socialCueScenarios[a.seed%socialCueScenarios.length],showEvidence=a.kind!=='test'&&a.level<=2,showUnknown=a.kind!=='test'&&a.level<=3;
 let out=`${textBlock(s.context,397,210,26,44)}<rect x="74" y="330" width="646" height="${showEvidence?170:120}" rx="24" fill="#EFF6FF" stroke="#60A5FA" stroke-width="2"/>${rtl(397,370,a.level<=2?'ما الدليل؟':'ما الذي نعرفه فعلًا من الموقف؟',22,800)}`;
 if(showEvidence)out+=s.evidence.map((e,i)=>`<rect x="${130+i*290}" y="410" width="240" height="58" rx="16" fill="#FFF" stroke="#93C5FD"/>${textBlock(e,250+i*290,444,18,24,'middle',2)}`).join('');
 else out+=`<line x1="130" y1="420" x2="665" y2="420" stroke="#94A3B8" stroke-width="2"/>`;
 const y2=showEvidence?545:485;
 out+=`<rect x="74" y="${y2}" width="646" height="${showUnknown?135:110}" rx="24" fill="#FFF7ED" stroke="#FDBA74" stroke-width="2"/>${rtl(397,y2+40,'ما الذي لا نعرفه بعد؟',22,800)}`;
 if(showUnknown)out+=textBlock(s.unknown,397,y2+80,18,52);
 else out+=`<line x1="130" y1="${y2+78}" x2="665" y2="${y2+78}" stroke="#94A3B8" stroke-width="2"/>`;
 const promptY=y2+(showUnknown?200:175);
 out+=`${textBlock(a.level>=4?'اكتب تفسيرين مختلفين، ثم سؤال تحقق محترمًا':'اكتب احتمالين أو سؤال تحقق محترمًا',397,promptY,22,52,'middle',2)}<line x1="120" y1="${promptY+65}" x2="674" y2="${promptY+65}" stroke="#94A3B8" stroke-width="2"/><line x1="120" y1="${promptY+125}" x2="674" y2="${promptY+125}" stroke="#94A3B8" stroke-width="2"/>`;
 if(a.level===5)out+=textBlock('لا تحسم المعنى إذا لم تكفِ الأدلة؛ اختر طريقة تحقق تحترم الشخص.',397,promptY+180,16,65,'middle',2);
 return out;
}
function perspective(a:SocialActivity){
 const s=perspectiveScenarios[a.seed%perspectiveScenarios.length],showLabels=a.kind!=='test'&&a.level<=2;
 let out=`${rtl(397,215,s.title,30,800)}<rect x="70" y="285" width="300" height="220" rx="28" fill="#ECFEFF" stroke="#22D3EE" stroke-width="2"/>${textBlock(s.a,220,350,22,25)}<rect x="424" y="285" width="300" height="220" rx="28" fill="#F5F3FF" stroke="#A78BFA" stroke-width="2"/>${textBlock(s.b,574,350,22,25)}<rect x="92" y="565" width="610" height="150" rx="24" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>${textBlock(s.question,397,610,23,48)}`;
 if(showLabels)out+=rtl(397,790,'من دوره؟ ماذا يعرف كل شخص؟',22,800);
 else if(a.level<=3)out+=rtl(397,790,'اكتب ما يعرفه كل شخص، ثم حدد ما لا يمكنه معرفته.',21,800);
 else out+=rtl(397,790,'تتبع: الدور · المعرفة · الرغبة · الحد الشخصي',21,800);
 out+=`<line x1="120" y1="855" x2="674" y2="855" stroke="#94A3B8" stroke-width="2"/><line x1="120" y1="915" x2="674" y2="915" stroke="#94A3B8" stroke-width="2"/>`;
 if(a.level===5)out+=textBlock('هل يمكن أن يكون لكل شخص منظور مختلف دون أن يكون أحدهما مخطئًا؟',397,965,15,70,'middle',2);
 return out;
}
function problem(a:SocialActivity){
 const s=problemScenarios[a.seed%problemScenarios.length],showOptions=a.kind!=='test'&&a.level<=2;
 let out=`${rtl(397,205,s.title,30,800)}${textBlock(s.situation,397,250,25,46)}${rtl(397,365,a.level<=2?'حلول ممكنة':'ولّد حلولًا ممكنة',22,800)}`;
 if(showOptions)out+=s.safe.map((x,i)=>`<rect x="112" y="${405+i*78}" width="570" height="56" rx="16" fill="#F0FDF4" stroke="#86EFAC"/>${textBlock(x,397,440+i*78,19,52,'middle',2)}`).join('');
 else out+=`<rect x="112" y="405" width="570" height="220" rx="16" fill="#FFF" stroke="#CBD5E1"/>${answerLine('حل',445,1)}${answerLine('حل',500,2)}${a.level>=4?answerLine('حل',555,3):''}`;
 const y=showOptions?660:655;
 out+=`<rect x="112" y="${y}" width="570" height="${showOptions?70:95}" rx="16" fill="#FEF2F2" stroke="#FCA5A5"/>${textBlock(a.level<=2?'حل يحتاج مراجعة':'افحص كل حل: هل هو آمن؟ هل يحترم الرفض والحدود؟',397,y+30,18,58,'middle',2)}${showOptions?textBlock(s.avoid[0],397,y+58,17,52,'middle',2):''}${rtl(665,805,'الخطة الأولى',19,800,INK,'start')}<line x1="405" y1="813" x2="555" y2="813" stroke="#94A3B8" stroke-width="2"/>${rtl(365,805,'الخطة البديلة',19,800,INK,'start')}<line x1="135" y1="813" x2="255" y2="813" stroke="#94A3B8" stroke-width="2"/>${textBlock(a.level>=4?'متى أغيّر الخطة؟ متى أنسحب؟ ومتى أطلب المساعدة؟':'متى أغيّر الخطة أو أطلب المساعدة؟',397,865,19,60,'middle',2)}<line x1="150" y1="920" x2="644" y2="920" stroke="#94A3B8" stroke-width="2"/>`;
 if(a.level===5)out+=textBlock('قد توجد عدة حلول صحيحة إذا كانت آمنة وتحترم الحدود وتخدم الهدف.',397,965,15,70,'middle',2);
 return out;
}
export function renderSocialSvg(a:SocialActivity){const body=a.taskType==='social-cues'?cue(a):a.taskType==='turn-taking-perspective'?perspective(a):problem(a);return `<svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(a.title)}">${header(a)}${body}${footer}</svg>`;}
