import type { EmotionalRegulationActivity } from './emotional-regulation-lab';

const esc=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]||c));
const P={navy:'#16324F',blue:'#2563EB',cyan:'#06B6D4',rose:'#F43F5E',amber:'#F59E0B',green:'#16A34A',violet:'#7C3AED',ink:'#1F2937',muted:'#64748B',paper:'#FFFDF8',line:'#CBD5E1'};
const rtl=(x:number,y:number,s:string,size=18,weight=600,fill=P.ink,anchor:'start'|'middle'|'end'='start')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" direction="rtl" unicode-bidi="plaintext" font-family="Tahoma,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`;
const ltr=(x:number,y:number,s:string,size=16,weight=600,fill=P.muted,anchor:'start'|'middle'|'end'='start')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" direction="ltr" unicode-bidi="plaintext" font-family="Arial,Tahoma,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`;
const line=(x1:number,y:number,x2:number)=>`<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#94A3B8" stroke-width="1.5"/>`;
const check=(x:number,y:number,label:string,w=112)=>`<g><rect x="${x}" y="${y}" width="${w}" height="34" rx="10" fill="#fff" stroke="#CBD5E1"/><rect x="${x+w-27}" y="${y+9}" width="16" height="16" rx="3" fill="#fff" stroke="#64748B"/>${rtl(x+w-35,y+23,label,13,600,P.ink,'start')}</g>`;
function header(a:EmotionalRegulationActivity){return `<rect width="794" height="1123" rx="24" fill="${P.paper}"/><rect x="36" y="34" width="722" height="112" rx="20" fill="#F8FAFC" stroke="${P.line}"/>${rtl(730,76,a.seriesTitle,28,800,P.navy,'start')}${rtl(730,112,`المستوى ${a.level} · ${a.label} · نشاط غير تشخيصي`,17,500,P.muted,'start')}${ltr(64,112,'Health Renewal',15,600,P.muted,'start')}`}
function footer(){return `<line x1="48" y1="1016" x2="746" y2="1016" stroke="${P.line}"/>${rtl(730,1050,'ملاحظة المرافق',15,700,P.muted,'start')}${line(70,1062,600)}${rtl(730,1088,'راقب الأداء والسياق؛ لا تحكم على الطفل أو تفسر الورقة كتقييم سريري.',13,500,P.muted,'start')}`}

type Emotion='فرح'|'حزن/قلق'|'غضب'|'دهشة'|'غير متأكد';
const emotions:Emotion[]=['فرح','حزن/قلق','غضب','دهشة','غير متأكد'];
function expression(x:number,y:number,e:Emotion){
 const eyeY=y-10;
 const base=`<circle cx="${x}" cy="${y}" r="38" fill="#FEF3C7" stroke="#A16207" stroke-width="2.5"/><circle cx="${x-13}" cy="${eyeY}" r="3.8" fill="#111827"/><circle cx="${x+13}" cy="${eyeY}" r="3.8" fill="#111827"/>`;
 if(e==='فرح')return `<g>${base}<path d="M ${x-17} ${y+10} Q ${x} ${y+28} ${x+17} ${y+10}" fill="none" stroke="#92400E" stroke-width="3" stroke-linecap="round"/></g>`;
 if(e==='غضب')return `<g>${base}<path d="M ${x-22} ${y-20} L ${x-7} ${y-14} M ${x+22} ${y-20} L ${x+7} ${y-14}" stroke="#92400E" stroke-width="3"/><path d="M ${x-16} ${y+23} Q ${x} ${y+9} ${x+16} ${y+23}" fill="none" stroke="#92400E" stroke-width="3"/></g>`;
 if(e==='دهشة')return `<g>${base}<circle cx="${x}" cy="${y+17}" r="8" fill="none" stroke="#92400E" stroke-width="3"/></g>`;
 if(e==='حزن/قلق')return `<g>${base}<path d="M ${x-18} ${y+24} Q ${x} ${y+8} ${x+18} ${y+24}" fill="none" stroke="#92400E" stroke-width="3"/><path d="M ${x-22} ${y-21} Q ${x-14} ${y-27} ${x-6} ${y-21} M ${x+6} ${y-21} Q ${x+14} ${y-27} ${x+22} ${y-21}" fill="none" stroke="#92400E" stroke-width="2"/></g>`;
 return `<g>${base}<path d="M ${x-14} ${y+18} L ${x+14} ${y+18}" stroke="#92400E" stroke-width="3"/></g>`;
}
function posture(x:number,y:number,e:Emotion){
 const shoulder=e==='حزن/قلق'?9:e==='غضب'?-5:0;
 const arm=e==='غضب'?34:e==='حزن/قلق'?18:27;
 return `<g stroke="#1D4ED8" stroke-width="5" stroke-linecap="round" fill="none"><path d="M ${x} ${y} L ${x} ${y+34}"/><path d="M ${x} ${y+9+shoulder} L ${x-arm} ${y+25} M ${x} ${y+9+shoulder} L ${x+arm} ${y+25}"/><path d="M ${x} ${y+34} L ${x-19} ${y+54} M ${x} ${y+34} L ${x+19} ${y+54}"/></g>`;
}
function emotionRecognition(a:EmotionalRegulationActivity){
 const contexts=['انكسرت لعبة طفل كان يحبها','دُعي طفل للعب مع أصدقاء جدد','سمع طفل صوتًا قويًا مفاجئًا','أنهى طفل مشروعًا كان يتدرب عليه','انتظر طفل دوره وقتًا طويلًا'];
 const ctx=contexts[a.seed%contexts.length],count=a.level<=2?3:a.level<=4?4:5;
 let out=`${rtl(730,188,`الموقف: ${ctx}`,20,800,P.ink,'start')}${rtl(730,224,a.level<=2?'انظر إلى الموقف والوجه. اختر شعورًا محتملًا ثم اذكر دليلك.':'انظر إلى الموقف والوجه والجسم. اختر احتمالًا واذكر دليلك، ولا تفترض أن هناك إجابة واحدة مؤكدة.',16,500,P.muted,'start')}`;
 for(let i=0;i<count;i++){
  const x=72+(i%3)*224,y=278+Math.floor(i/3)*220,e=emotions[i];
  const answer=a.kind==='test'?`${rtl(x+164,y+174,'اكتب',12,700,P.muted,'start')}${line(x+24,y+176,x+116)}`:rtl(x+95,y+174,e,15,700,P.ink,'middle');
  out+=`<rect x="${x}" y="${y}" width="190" height="190" rx="22" fill="#fff" stroke="${P.line}" stroke-width="2"/>${expression(x+95,y+58,e)}${a.level>=3?posture(x+95,y+92,e):''}<rect x="${x+16}" y="${y+154}" width="158" height="28" rx="10" fill="#F8FAFC"/>${answer}`;
 }
 out+=`<rect x="70" y="760" width="654" height="205" rx="18" fill="#F8FAFC" stroke="${P.line}"/>${rtl(700,802,'ما الدليل الذي استخدمته؟',17,800,P.navy,'start')}${check(565,820,'ما حدث',125)}${check(425,820,'الوجه',125)}${check(285,820,'الجسم',125)}${check(145,820,'الكلمات/الصوت',125)}${rtl(700,895,'احتمال آخر',15,700,P.ink,'start')}${line(120,906,570)}${a.level>=4?`${rtl(700,940,'ما المعلومة التي تحتاجها قبل أن تكون أكثر تأكدًا؟',14,600,P.muted,'start')}${line(120,952,570)}`:''}`;
 return out;
}
function bodySignals(a:EmotionalRegulationActivity){
 const labels=['دقات القلب','التنفس','اليد/العضلات','الوجه/الحرارة','المعدة','يختلف عندي/لا أعرف'],n=a.level<=2?4:6;
 let out=`${rtl(730,188,'خريطة إشارات جسمي',20,800,P.ink,'start')}${rtl(730,224,a.level<=2?'لاحظ جسمك الآن. ضع علامة على الوصف الأقرب لك؛ يمكنك اختيار «لا أعرف».':'قارن الإشارات بين موقفين أو شدتين. الإشارة نفسها لا تعني الشعور نفسه دائمًا.',16,500,P.muted,'start')}`;
 for(let i=0;i<n;i++){
  const x=72+(i%2)*340,y=274+Math.floor(i/2)*178;
  out+=`<rect x="${x}" y="${y}" width="312" height="140" rx="20" fill="#fff" stroke="${P.line}"/>${rtl(x+282,y+40,labels[i],17,700,P.ink,'start')}`;
  const opts=a.level>=3?['لا ألاحظ','خفيف','واضح','قوي']:['لا','قليل','واضح'];
  if(a.level>=3)opts.forEach((o,j)=>{out+=check(x+18+(j%2)*142,y+60+Math.floor(j/2)*38,o,128)});
  else opts.forEach((o,j)=>{out+=check(x+18+j*92,y+76,o,84)});
 }
 out+=`${rtl(700,858,'إشارة أخرى عندي',15,700,P.ink,'start')}${line(100,870,555)}${a.level===5?`${rtl(700,918,'ما السياق الذي ظهرت فيه الإشارة؟',15,700,P.ink,'start')}${line(100,930,555)}`:''}`;
 return out;
}
function intensity(a:EmotionalRegulationActivity){
 const n=a.level<2?3:5,labels=n===3?['خفيف','متوسط','قوي']:['1','2','3','4','5'];
 let out=`${rtl(730,188,'كم شدة الشعور الآن؟',20,800,P.ink,'start')}${rtl(730,224,'اختر الدرجة التي تعبّر عنك أنت. لا يحدد شخص آخر الدرجة بدلًا منك.',16,500,P.muted,'start')}`;
 labels.forEach((l,i)=>{const w=n===3?180:112,x=n===3?105+i*220:78+i*136,h=220,y=330,fill=['#DBEAFE','#CFFAFE','#FEF3C7','#FED7AA','#FECACA'][Math.min(i+(5-n),4)];out+=`<rect x="${x}" y="${y+(n===5?(4-i)*20:0)}" width="${w}" height="${h-(n===5?(4-i)*20:0)}" rx="22" fill="${fill}" stroke="${P.line}"/>${rtl(x+w/2,y+105,l,n===3?22:30,800,P.navy,'middle')}<circle cx="${x+w/2}" cy="${y+165}" r="22" fill="#fff" stroke="${P.navy}" stroke-width="2"/>`});
 out+=`<rect x="85" y="665" width="624" height="250" rx="20" fill="#fff" stroke="${P.line}"/>${rtl(685,710,'لماذا اخترت هذه الدرجة؟',17,800,P.ink,'start')}${line(120,750,675)}${line(120,795,675)}${a.level>=3?`${rtl(685,842,'قبل',14,600,P.ink,'start')}${line(560,850,620)}${rtl(520,842,'بعد دقيقة',14,600,P.ink,'start')}${line(390,850,480)}${rtl(350,842,'بعد خطوة تنظيم',14,600,P.ink,'start')}${line(155,850,300)}`:''}`;
 return out;
}
function strategies(a:EmotionalRegulationActivity){
 const scenarios=['اختلفت مع صديق وأنت غاضب','شعرت بتوتر قبل مهمة جديدة','المكان صاخب جدًا وأصبح التركيز صعبًا','فشلت المحاولة الأولى في نشاط مهم','شعرت بحزن وتريد بعض الوقت'],sc=scenarios[a.seed%scenarios.length],opts=['تنفس ببطء أو خفف سرعة الجسم','اطلب استراحة أو مكانًا أهدأ','اطلب مساعدة من شخص موثوق','قسّم المشكلة إلى خطوة صغيرة','اختر خيارًا آخر يناسبك'];
 let out=`${rtl(730,188,`الموقف: ${sc}`,20,800,P.ink,'start')}${rtl(730,224,a.level<=2?'اختر خطوة مناسبة الآن. قد توجد أكثر من إجابة جيدة.':'حدد هدفك أولًا، ثم اختر خطة مناسبة للسياق واذكر لماذا.',16,500,P.muted,'start')}`;
 const shown=a.level<=2?opts.slice(0,3):opts;shown.forEach((o,i)=>{const y=275+i*(a.level<=2?150:118);out+=`<rect x="80" y="${y}" width="634" height="${a.level<=2?118:92}" rx="18" fill="${i%2?'#F8FAFC':'#fff'}" stroke="${P.line}"/><circle cx="118" cy="${y+(a.level<=2?59:46)}" r="16" fill="#fff" stroke="${[P.blue,P.cyan,P.green,P.amber,P.violet][i]}" stroke-width="3"/>${rtl(680,y+38,o,16,700,P.ink,'start')}${a.level>=3?rtl(680,y+67,['تهدئة الجسم','تعديل البيئة','طلب الدعم','حل المشكلة','خطة شخصية'][i],13,500,P.muted,'start'):''}`});
 const baseY=a.level<=2?770:880;out+=`<rect x="80" y="${baseY}" width="634" height="${a.level>=4?95:65}" rx="14" fill="#FEFCE8" stroke="#FDE68A"/>${rtl(680,baseY+34,'الخطة الأولى',15,700,P.ink,'start')}${line(170,baseY+43,545)}${a.level>=4?`${rtl(680,baseY+68,'متى أغيّرها؟ وما البديل؟',14,600,P.muted,'start')}${line(170,baseY+78,475)}`:''}`;
 return out;
}
export function renderEmotionalRegulationSvg(a:EmotionalRegulationActivity){const body=a.taskType==='emotion-recognition'?emotionRecognition(a):a.taskType==='body-signals'?bodySignals(a):a.taskType==='emotion-intensity'?intensity(a):strategies(a);return `<svg xmlns="http://www.w3.org/2000/svg" width="794" height="1123" viewBox="0 0 794 1123" role="img" aria-label="${esc(a.title)}">${header(a)}${body}${footer()}</svg>`;}
