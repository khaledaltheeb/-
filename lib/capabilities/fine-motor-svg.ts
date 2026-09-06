import type { FineMotorActivity } from './fine-motor-lab';

const W=794,H=1123,INK='#0F172A',MUTED='#64748B',LINE='#CBD5E1',BLUE='#2563EB',VIOLET='#7C3AED',ORANGE='#F97316',GREEN='#16A34A';
const esc=(s:string)=>s.replace(/[&<>"']/g,(m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]!));
const rng=(seed:number)=>{let x=seed>>>0;return()=>((x=(x*1664525+1013904223)>>>0)/4294967296)};
const wrap=(s:string,n=54)=>{const words=s.split(/\s+/),out:string[]=[];let line='';for(const w of words){const next=line?`${line} ${w}`:w;if(next.length>n&&line){out.push(line);line=w}else line=next}if(line)out.push(line);return out.slice(0,2)};
const text=(x:number,y:number,s:string,size=18,weight=600,fill=INK,anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" direction="rtl" unicode-bidi="plaintext" font-family="Tahoma,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`;
const instruction=(a:FineMotorActivity)=>wrap(a.instruction,60).map((l,i)=>text(397,163+i*25,l,15,600,'#334155')).join('');
const base=(a:FineMotorActivity,body:string)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(a.title)}"><rect width="100%" height="100%" fill="#FFFDF8"/><rect x="34" y="28" width="726" height="110" rx="24" fill="#FFF7ED" stroke="#FED7AA" stroke-width="2"/>${text(727,70,a.seriesTitle,27,800,'#1F2937','end')}${text(727,105,`المستوى ${a.level} · ${a.label}`,18,600,'#475569','end')}<rect x="72" y="145" width="650" height="${wrap(a.instruction,60).length>1?62:48}" rx="16" fill="#F8FAFC" stroke="#E2E8F0"/>${instruction(a)}${body}<rect x="48" y="1012" width="698" height="72" rx="18" fill="#F8FAFC" stroke="#CBD5E1"/>${text(720,1040,'ملاحظة الأداء: دقة · استمرارية · تلميحات · راحة اليد',15,700,'#334155','end')}${text(720,1068,`المدة: ${a.duration} | العمر الإرشادي: ${a.age}`,14,500,MUTED,'end')}</svg>`;

const arrow=(x1:number,y1:number,x2:number,y2:number,color='#64748B')=>`<path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="${color}" stroke-width="3" stroke-linecap="round"/><path d="M ${x2} ${y2} l -10 -6 l 3 12 z" fill="${color}"/>`;

function basicLines(a:FineMotorActivity){
 const r=rng(a.seed),training=a.kind!=='test',rows=4+(a.level>=4?1:0);let s=text(700,238,a.kind==='test'?'انسخ كل نموذج مرة واحدة في المساحة المقابلة':'تتبّع النموذج ثم انسخه في المساحة الفارغة',20,800,INK,'end');
 for(let row=0;row<rows;row++){
  const y=315+row*(600/rows),x1=100,x2=340,copyX=455,w=235,h=95;
  s+=`<rect x="70" y="${y-48}" width="300" height="96" rx="16" fill="#FFFFFF" stroke="#CBD5E1"/><rect x="420" y="${y-48}" width="304" height="96" rx="16" fill="#FFFFFF" stroke="#94A3B8" stroke-dasharray="7 6"/>`;
  let d='';
  if(a.level===1)d=row%2===0?`M ${x1+25} ${y} L ${x2-25} ${y}`:`M ${(x1+x2)/2} ${y-34} L ${(x1+x2)/2} ${y+34}`;
  else if(a.level===2)d=row%2===0?`M ${x1+20} ${y-28} L ${x2-20} ${y+28}`:`M ${x1+20} ${y+28} L ${x2-20} ${y-28}`;
  else if(a.level===3)d=row%2===0?`M ${x1+30} ${y-32} L ${x2-30} ${y+32} M ${x1+30} ${y+32} L ${x2-30} ${y-32}`:`M ${(x1+x2)/2} ${y-34} L ${(x1+x2)/2} ${y+34} M ${x1+35} ${y} L ${x2-35} ${y}`;
  else if(a.level===4){const j=(r()-.5)*12;d=`M ${x1+20} ${y+30} L ${x1+90} ${y-25+j} L ${x1+165} ${y+22} L ${x2-20} ${y-30}`;}
  else {const j=(r()-.5)*10;d=`M ${x1+18} ${y+30} L ${x1+68} ${y-28+j} L ${x1+122} ${y+10} L ${x1+176} ${y-30} L ${x2-18} ${y+24}`;}
  s+=`<path d="${d}" fill="none" stroke="#334155" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" ${training?'stroke-dasharray="8 6"':''}/>`;
  if(a.kind==='training-a')s+=arrow(x1+10,y+40,x1+65,y+40,BLUE);
  s+=`<circle cx="${copyX}" cy="${y}" r="5" fill="${a.kind==='test'?'#CBD5E1':'#22C55E'}"/>`;
 }
 return s;
}

function curves(a:FineMotorActivity){
 const r=rng(a.seed),rows=4;let s=text(700,238,a.kind==='test'?'انسخ الحركة في المربع المقابل دون نموذج إضافي':'تتبّع الحركة ثم أكملها أو انسخها',20,800,INK,'end');
 for(let row=0;row<rows;row++){
  const y=325+row*155,modelX=95,copyX=440;
  s+=`<rect x="70" y="${y-55}" width="300" height="110" rx="18" fill="#FFF" stroke="#CBD5E1"/><rect x="420" y="${y-55}" width="304" height="110" rx="18" fill="#FFF" stroke="#94A3B8" stroke-dasharray="7 6"/>`;
  const flip=(a.seed+row)%2?-1:1;let d='';
  if(a.level===1)d=`M ${modelX+25} ${y+25} Q ${modelX+145} ${y-55*flip} ${modelX+250} ${y+25}`;
  else if(a.level===2)d=`M ${modelX+75} ${y} a 55 55 0 1 ${flip>0?1:0} 110 0 a 55 55 0 1 ${flip>0?1:0} -110 0`;
  else if(a.level===3)d=`M ${modelX+20} ${y+22} q 50 -70 100 0 q 50 70 100 0`;
  else if(a.level===4)d=`M ${modelX+25} ${y+28} c 30 -70 115 -70 125 0 c 10 62 -88 68 -92 5 c -3 -52 78 -58 120 -12`;
  else d=`M ${modelX+20} ${y+28} q 35 -65 70 0 q 35 65 70 0 c 35 -62 72 -62 104 0`;
  s+=`<path d="${d}" fill="none" stroke="${VIOLET}" stroke-width="4" stroke-linecap="round" ${a.kind==='test'?'':'stroke-dasharray="8 6"'}/>`;
  if(a.kind==='training-a')s+=arrow(modelX+15,y+42,modelX+72,y+42,VIOLET);
  const guide=a.kind==='training-a'?2:a.kind==='training-b'?1:0;for(let g=0;g<guide;g++)s+=`<circle cx="${copyX+45+g*95+(r()-.5)*8}" cy="${y}" r="5" fill="#CBD5E1"/>`;
 }
 return s;
}

function scissorsIcon(x:number,y:number){return `<g transform="translate(${x} ${y})"><circle cx="-12" cy="10" r="10" fill="none" stroke="#475569" stroke-width="4"/><circle cx="12" cy="10" r="10" fill="none" stroke="#475569" stroke-width="4"/><path d="M -5 3 L 34 -24 M 5 3 L 34 24" stroke="#475569" stroke-width="4" stroke-linecap="round"/></g>`;}
function scissors(a:FineMotorActivity){
 const r=rng(a.seed),x0=105,y0=405,w=575,j=(r()-.5)*28;let d=`M ${x0} ${y0}`;
 if(a.level===1)d+=` L ${x0+w} ${y0+j}`;
 else if(a.level===2)d+=` L 370 ${y0} L 370 ${y0+150} L 690 ${y0+150+j}`;
 else if(a.level===3)d+=` C 220 ${y0-90} 345 ${y0+120} 470 ${y0} S 650 ${y0-95} 690 ${y0+80+j}`;
 else if(a.level===4)d+=` L 210 315 L 320 475 L 430 315 L 540 475 L 690 335`;
 else d+=` C 190 285 260 530 360 390 S 500 250 580 420 Q 650 535 700 350`;
 return `${text(700,238,'إشراف بالغ · استخدم مقص أطفال آمنًا · قص على الخط فقط',19,800,'#9A3412','end')}<rect x="70" y="275" width="654" height="620" rx="26" fill="#FFF" stroke="#FED7AA"/>${scissorsIcon(95,365)}<path d="${d}" fill="none" stroke="#E2E8F0" stroke-width="${a.kind==='test'?18:24}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${ORANGE}" stroke-width="${Math.max(5,11-a.level)}" stroke-dasharray="14 10" stroke-linecap="round"/>${a.kind==='training-a'?arrow(115,450,180,450,ORANGE):''}`;
}

function coloringShape(kind:number,cx:number,cy:number,s:number){
 if(kind%4===0)return `<g><circle cx="${cx}" cy="${cy}" r="${s*.34}" fill="#FFF" stroke="#334155" stroke-width="5"/><path d="M ${cx} ${cy-s*.34} C ${cx+s*.08} ${cy-s*.48} ${cx+s*.24} ${cy-s*.46} ${cx+s*.28} ${cy-s*.31}" fill="none" stroke="#334155" stroke-width="5"/><path d="M ${cx+s*.04} ${cy-s*.37} Q ${cx+s*.2} ${cy-s*.55} ${cx+s*.36} ${cy-s*.38} Q ${cx+s*.22} ${cy-s*.24} ${cx+s*.04} ${cy-s*.37}" fill="#FFF" stroke="#334155" stroke-width="4"/></g>`;
 if(kind%4===1)return `<g><polygon points="${cx},${cy-s*.42} ${cx+s*.36},${cy} ${cx},${cy+s*.42} ${cx-s*.36},${cy}" fill="#FFF" stroke="#334155" stroke-width="5"/><path d="M ${cx} ${cy+s*.42} q 18 32 0 62" fill="none" stroke="#334155" stroke-width="4"/></g>`;
 if(kind%4===2){const petals=Array.from({length:6},(_,i)=>{const q=i*Math.PI/3;return `<circle cx="${cx+Math.cos(q)*s*.22}" cy="${cy+Math.sin(q)*s*.22}" r="${s*.18}" fill="#FFF" stroke="#334155" stroke-width="4"/>`}).join('');return `<g>${petals}<circle cx="${cx}" cy="${cy}" r="${s*.12}" fill="#FFF" stroke="#334155" stroke-width="4"/></g>`;}
 return `<g><rect x="${cx-s*.3}" y="${cy-s*.18}" width="${s*.6}" height="${s*.45}" fill="#FFF" stroke="#334155" stroke-width="5"/><polygon points="${cx-s*.38},${cy-s*.18} ${cx},${cy-s*.48} ${cx+s*.38},${cy-s*.18}" fill="#FFF" stroke="#334155" stroke-width="5"/><rect x="${cx-s*.08}" y="${cy+s*.02}" width="${s*.16}" height="${s*.25}" fill="#FFF" stroke="#334155" stroke-width="4"/></g>`;
}
function coloring(a:FineMotorActivity){
 const r=rng(a.seed),count=[1,2,3,4,5][a.level-1];let s=text(700,238,'لوّن المساحات البيضاء مع المحافظة على الحدود؛ اللون اختيارك',20,800,INK,'end');
 for(let i=0;i<count;i++){const cols=count<=2?2:3,x=160+(i%cols)*(count<=2?470:235),y=405+Math.floor(i/cols)*310,size=count<=2?210:155;s+=coloringShape((Math.floor(r()*4)+i)%4,x,y,size)}
 if(a.level>=4)s+=`<path d="M 95 820 C 210 745 300 900 410 820 S 600 745 705 835" fill="none" stroke="#334155" stroke-width="5"/>`;
 return s;
}

function pencil(a:FineMotorActivity){
 const r=rng(a.seed),width=[72,60,48,38,30][a.level-1],j=(r()-.5)*50;const d=`M 95 ${380+j} C 205 ${265+a.level*16}, 270 ${555-a.level*12}, 380 420 S 570 ${300+a.level*18}, 700 ${455+j*.3} C 620 575 515 650 390 605 S 205 530 105 750`;
 return `${text(700,238,'حرّك القلم داخل الممر وعدّل السرعة عند المنعطفات',20,800,INK,'end')}<path d="${d}" fill="none" stroke="#E0F2FE" stroke-width="${width}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#0EA5E9" stroke-width="3" ${a.kind==='test'?'':'stroke-dasharray="9 8"'}/><circle cx="95" cy="${380+j}" r="12" fill="#22C55E"/>${a.kind==='training-a'?arrow(115,345,180,330,BLUE):''}`;
}

function patternPath(level:number,x:number,y:number,variant:number){
 if(level===1)return`M ${x} ${y+35} L ${x-42} ${y-5}`;
 if(level===2)return variant%2?`M ${x} ${y+35} Q ${x-21} ${y-20} ${x-42} ${y+35}`:`M ${x} ${y+35} L ${x-42} ${y-5}`;
 if(level===3)return`M ${x} ${y+35} q -22 -52 -44 0 q -22 52 -44 0`;
 if(level===4)return`M ${x} ${y+35} q -20 -48 -40 0 l -24 -30`;
 return`M ${x} ${y+35} q -18 -46 -36 0 q -18 46 -36 0 l -22 -30`;
}
function prewriting(a:FineMotorActivity){
 const r=rng(a.seed),rows=4,models=a.kind==='training-a'?3:a.kind==='training-b'?2:1;let s=text(700,238,a.kind==='test'?'انظر إلى النموذج ثم أكمل السطر بالنمط نفسه':'تتبّع النماذج الأولى ثم واصل النمط بنفس الحجم والمسافة',20,800,INK,'end');
 for(let row=0;row<rows;row++){const y=330+row*165,variant=Math.floor(r()*4);s+=`<line x1="85" y1="${y+55}" x2="710" y2="${y+55}" stroke="#CBD5E1" stroke-width="2"/>`;for(let i=0;i<7;i++){const x=690-i*86;if(i<models)s+=`<path d="${patternPath(a.level,x,y,variant)}" stroke="#475569" stroke-width="3" fill="none" ${a.kind==='test'&&i===0?'':'stroke-dasharray="6 5"'}/>`;else s+=`<circle cx="${x-20}" cy="${y+35}" r="3" fill="#E2E8F0"/>`;}}
 return s;
}

export function renderFineMotorWorksheet(a:FineMotorActivity){const body=a.taskType==='basic-lines'?basicLines(a):a.taskType==='curves-circles-spirals'?curves(a):a.taskType==='scissor-control'?scissors(a):a.taskType==='coloring-boundaries'?coloring(a):a.taskType==='pencil-control'?pencil(a):prewriting(a);return base(a,body);}
