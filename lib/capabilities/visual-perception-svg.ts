import type { VisualPerceptionActivity } from './visual-perception-lab';

const W = 794;
const H = 1123;
const palette = ['#2563EB','#EC4899','#F59E0B','#10B981','#8B5CF6','#06B6D4','#EF4444'];

function esc(value: string) {
  return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function rng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function text(x:number,y:number,value:string,size=22,weight=600,fill='#0F172A',anchor='middle') {
  return `<text x="${x}" y="${y}" font-family="Tahoma,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" direction="rtl">${esc(value)}</text>`;
}

function wrap(value:string, max=62) {
  const words = value.split(/\s+/); const lines:string[]=[]; let line='';
  words.forEach((word)=>{ const next=line?`${line} ${word}`:word; if(next.length>max && line){lines.push(line);line=word;}else line=next; });
  if(line) lines.push(line); return lines.slice(0,2);
}

function header(activity: VisualPerceptionActivity) {
  const lines = wrap(activity.instruction, 58);
  const instruction = lines.map((line,i)=>text(W/2,168+i*30,line,21,600,'#FFFFFF')).join('');
  return `
  <rect width="${W}" height="${H}" fill="#FFFFFF"/>
  <rect x="28" y="25" width="738" height="92" rx="28" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
  ${text(70,62,`المستوى ${activity.level}`,18,800,'#7C3AED','start')}
  ${text(W/2,67,activity.seriesTitle,30,800,'#0F172A')}
  ${text(724,62,activity.label,18,800,activity.kind==='test'?'#BE123C':'#0369A1','end')}
  ${text(W/2,98,activity.kind==='test'?'اختبار إتقان - نموذج جديد':'نشاط تدريبي متدرج',16,600,'#64748B')}
  <rect x="28" y="130" width="738" height="${lines.length>1?82:62}" rx="20" fill="#2563EB"/>
  ${instruction}
  `;
}

function footer(activity: VisualPerceptionActivity) {
  return `
  <rect x="28" y="1020" width="738" height="70" rx="20" fill="#F8FAFC" stroke="#CBD5E1"/>
  ${text(740,1048,'الاسم: __________________',16,600,'#334155','end')}
  ${text(470,1048,'التاريخ: __________',16,600,'#334155','end')}
  ${text(260,1048,'صحيح: ____',16,600,'#334155','end')}
  ${text(120,1048,'تلميحات: ____',16,600,'#334155','end')}
  ${text(W/2,1076,'روافد | ورقة تدريب ومتابعة وليست أداة تشخيص معيارية',14,600,'#64748B')}
  `;
}

function butterfly(x:number,y:number,s:number,rot:number,color:string,dot=true) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <ellipse cx="-20" cy="-8" rx="22" ry="30" fill="${color}" opacity=".9"/>
    <ellipse cx="20" cy="-8" rx="22" ry="30" fill="${color}" opacity=".72"/>
    <ellipse cx="-17" cy="23" rx="16" ry="20" fill="${color}" opacity=".65"/>
    <ellipse cx="17" cy="23" rx="16" ry="20" fill="${color}" opacity=".55"/>
    <ellipse cx="0" cy="5" rx="6" ry="33" fill="#334155"/>
    <path d="M-2 -27 Q-14 -43 -22 -38 M2 -27 Q14 -43 22 -38" stroke="#334155" stroke-width="3" fill="none"/>
    ${dot?'<circle cx="-20" cy="-10" r="5" fill="#fff"/><circle cx="20" cy="-10" r="5" fill="#fff"/>':''}
  </g>`;
}

function fish(x:number,y:number,s:number,rot:number,color:string,eye=true) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <ellipse cx="0" cy="0" rx="28" ry="18" fill="${color}"/>
    <path d="M-24 0 L-48 -20 L-48 20 Z" fill="${color}" opacity=".75"/>
    <path d="M-3 -17 L10 -31 L18 -13 Z" fill="${color}" opacity=".65"/>
    ${eye?'<circle cx="14" cy="-4" r="4" fill="#fff"/><circle cx="15" cy="-4" r="2" fill="#0F172A"/>':''}
  </g>`;
}

function abstractShape(x:number,y:number,s:number,rot:number,color:string,mirror=false,notch=false) {
  const pts = mirror ? '-38,-24 -6,-38 34,-18 26,12 5,34 -28,24 -18,4' : '38,-24 6,-38 -34,-18 -26,12 -5,34 28,24 18,4';
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <polygon points="${pts}" fill="${color}" stroke="#0F172A" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="${mirror?-13:13}" cy="-12" r="5" fill="#fff"/>
    ${notch?`<circle cx="${mirror?25:-25}" cy="10" r="8" fill="#fff"/>`:''}
  </g>`;
}

function discrimination(activity:VisualPerceptionActivity, random:()=>number) {
  const rows = 4 + (activity.level>=4?1:0);
  const count = 4 + activity.level;
  let out = text(W/2,245,'في كل صف: أي فراشة تختلف عن البقية؟',22,800,'#7C3AED');
  for(let r=0;r<rows;r++){
    const y=315+r*130;
    const odd=Math.floor(random()*count);
    const baseColor=palette[(r+activity.variant)%palette.length];
    for(let c=0;c<count;c++){
      const x=90+c*((W-180)/(count-1));
      const isOdd=c===odd;
      let color=baseColor, rot=0, scale=.7, dot=true;
      const mode = Math.min(4, activity.level-1);
      if(isOdd){
        if(mode===0) color=palette[(r+3)%palette.length];
        else if(mode===1) rot=35;
        else if(mode===2) scale=.58;
        else if(mode===3) dot=false;
        else { rot=18; dot=false; }
      }
      out += butterfly(x,y,scale,rot,color,dot);
    }
    out += `<line x1="52" y1="${y+58}" x2="742" y2="${y+58}" stroke="#E2E8F0" stroke-width="2"/>`;
  }
  return out;
}

function figureGround(activity:VisualPerceptionActivity, random:()=>number) {
  const targets=3+activity.level;
  const clutter=18+activity.level*7;
  let out=text(W/2,232,'ابحث عن جميع الأسماك الوردية داخل المشهد',22,800,'#BE185D');
  out += `<rect x="45" y="270" width="704" height="700" rx="28" fill="#ECFEFF" stroke="#67E8F9" stroke-width="3"/>`;
  for(let i=0;i<clutter;i++){
    const x=75+random()*640, y=305+random()*620, size=8+random()*22;
    const color=palette[Math.floor(random()*palette.length)];
    const type=i%4;
    if(type===0) out+=`<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" opacity=".38"/>`;
    else if(type===1) out+=`<rect x="${x-size}" y="${y-size}" width="${size*2}" height="${size*2}" rx="6" fill="${color}" opacity=".25" transform="rotate(${random()*50} ${x} ${y})"/>`;
    else if(type===2) out+=`<path d="M${x-size} ${y} Q${x} ${y-size*1.6} ${x+size} ${y}" stroke="${color}" stroke-width="5" fill="none" opacity=".42"/>`;
    else out+=`<path d="M${x-size} ${y-size} L${x+size} ${y+size} M${x+size} ${y-size} L${x-size} ${y+size}" stroke="${color}" stroke-width="4" opacity=".3"/>`;
  }
  const placed:{x:number;y:number}[]=[];
  for(let i=0;i<targets;i++){
    let x=0,y=0,tries=0;
    do { x=105+random()*585; y=340+random()*545; tries++; } while(placed.some(p=>Math.hypot(p.x-x,p.y-y)<90)&&tries<30);
    placed.push({x,y});
    out += fish(x,y,.62,random()*60-30,'#EC4899',true);
    if(activity.level>=3 && i%2===0) out+=`<circle cx="${x-25}" cy="${y+12}" r="18" fill="#D9F99D" opacity=".55"/>`;
  }
  for(let i=0;i<4+activity.level;i++) out+=fish(100+random()*590,330+random()*560,.58,random()*70-35,palette[Math.floor(random()*palette.length)],true);
  return out;
}

function closure(activity:VisualPerceptionActivity, random:()=>number) {
  const questions=4+(activity.level>=4?1:0); let out=text(W/2,232,'اختر الشكل الكامل الذي يطابق كل نموذج ناقص',22,800,'#7C3AED');
  for(let q=0;q<questions;q++){
    const y=315+q*135; const refColor=palette[(q+2)%palette.length]; const rot=(q*23)%90;
    out+=`<rect x="45" y="${y-55}" width="704" height="112" rx="18" fill="#FAFAFF" stroke="#DDD6FE"/>`;
    out+=abstractShape(125,y,.7,rot,refColor,false,false);
    const coverCount=1+activity.level;
    for(let k=0;k<coverCount;k++){
      const ox=90+(k%3)*25+random()*10, oy=y-38+Math.floor(k/3)*28;
      out+=`<rect x="${ox}" y="${oy}" width="34" height="24" rx="5" fill="#FFFFFF"/>`;
    }
    out+=text(205,y+8,'؟',32,900,'#94A3B8');
    const opts=shuffle([
      {m:false,n:false,r:rot},{m:true,n:false,r:rot},{m:false,n:true,r:rot+20}
    ],random);
    opts.forEach((o,i)=>{const x=380+i*130;out+=abstractShape(x,y,.62,o.r,refColor,o.m,o.n);});
  }
  return out;
}

const relationNames=['فوق','تحت','داخل','خارج','يمين','يسار','بين'];
function miniScene(cx:number,cy:number,relation:string,correct:boolean,color:string) {
  let tx=cx,ty=cy-40;
  const rel=correct?relation:({فوق:'تحت',تحت:'فوق',داخل:'خارج',خارج:'داخل',يمين:'يسار',يسار:'يمين',بين:'فوق'} as Record<string,string>)[relation]||'تحت';
  if(rel==='فوق'){tx=cx;ty=cy-38;} if(rel==='تحت'){tx=cx;ty=cy+46;} if(rel==='يمين'){tx=cx+42;ty=cy+5;} if(rel==='يسار'){tx=cx-42;ty=cy+5;}
  let base=`<rect x="${cx-30}" y="${cy-20}" width="60" height="50" rx="8" fill="#E2E8F0" stroke="#64748B" stroke-width="2"/>`;
  if(rel==='داخل'){tx=cx;ty=cy+2;} if(rel==='خارج'){tx=cx+55;ty=cy-28;} if(rel==='بين'){
    base=`<circle cx="${cx-42}" cy="${cy+5}" r="20" fill="#CBD5E1"/><circle cx="${cx+42}" cy="${cy+5}" r="20" fill="#CBD5E1"/>`; tx=cx;ty=cy+5;
  }
  return `<g>${base}<polygon points="${tx},${ty-13} ${tx+4},${ty-4} ${tx+14},${ty-4} ${tx+6},${ty+3} ${tx+9},${ty+13} ${tx},${ty+7} ${tx-9},${ty+13} ${tx-6},${ty+3} ${tx-14},${ty-4} ${tx-4},${ty-4}" fill="${color}"/></g>`;
}

function spatial(activity:VisualPerceptionActivity, random:()=>number) {
  const questions=5; let out=text(W/2,232,'في كل سطر اختر المشهد الذي يحقق العلاقة المكتوبة',22,800,'#0369A1');
  for(let q=0;q<questions;q++){
    const y=315+q*132; const maxRel=activity.level===1?4:activity.level===2?6:7;
    const relation=relationNames[(q+activity.seed)%maxRel];
    out+=`<rect x="45" y="${y-52}" width="704" height="108" rx="18" fill="#F0F9FF" stroke="#BAE6FD"/>`;
    out+=text(105,y+8,relation,22,900,'#0369A1');
    const correctIndex=Math.floor(random()*3);
    for(let i=0;i<3;i++) out+=miniScene(340+i*145,y,relation,i===correctIndex,palette[(i+q)%palette.length]);
  }
  return out;
}

function formConstancy(activity:VisualPerceptionActivity, random:()=>number) {
  let out=text(W/2,232,'ضع دائرة حول كل شكل هو نفس الشكل المرجعي',22,800,'#047857');
  out+=`<rect x="285" y="260" width="224" height="125" rx="22" fill="#ECFDF5" stroke="#6EE7B7" stroke-width="2"/>`;
  out+=text(W/2,292,'الشكل المرجعي',16,800,'#047857');
  out+=abstractShape(W/2,340,.72,0,'#10B981',false,false);
  const cols=5, rows=4, cellW=130, cellH=125, startX=135,startY=455;
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
    const idx=r*cols+c; const x=startX+c*cellW, y=startY+r*cellH;
    const correct=random() < (activity.level<=2?.48:.38);
    const rot=activity.level<=2?0:Math.floor(random()*8)*45;
    const scale=.48+random()*.26;
    const color=palette[Math.floor(random()*palette.length)];
    const distractorType = idx % 3;
    const mirror = !correct && (distractorType === 0 || distractorType === 2);
    const notch = !correct && (distractorType === 1 || distractorType === 2);
    out+=`<rect x="${x-50}" y="${y-48}" width="100" height="96" rx="16" fill="#F8FAFC" stroke="#E2E8F0"/>`;
    out+=abstractShape(x,y,scale,rot,color,mirror,notch);
    if(activity.level===1 && idx%4===0) out+=`<circle cx="${x+38}" cy="${y-37}" r="5" fill="#10B981" opacity=".55"/>`;
  }
  return out;
}

function mentalRotation(activity:VisualPerceptionActivity, random:()=>number) {
  const questions=4+(activity.level>=4?1:0); let out=text(W/2,232,'اختر الشكل نفسه بعد الدوران — انتبه: الانعكاس ليس دورانًا',21,800,'#7C3AED');
  for(let q=0;q<questions;q++){
    const y=315+q*135; const baseColor=palette[(q+4)%palette.length];
    out+=`<rect x="45" y="${y-55}" width="704" height="112" rx="18" fill="#FAF5FF" stroke="#E9D5FF"/>`;
    out+=abstractShape(125,y,.62,0,baseColor,false,false);
    out+=text(205,y+7,'→',30,900,'#7C3AED');
    const allowed=activity.level<=1?[90]:activity.level===2?[90,180]:[45,90,135,180,225,270];
    const angle=allowed[Math.floor(random()*allowed.length)];
    const opts=shuffle([
      {m:false,n:false,r:angle},{m:true,n:false,r:angle},{m:false,n:true,r:angle+(activity.level>=4?15:45)}
    ],random);
    opts.forEach((o,i)=>out+=abstractShape(385+i*125,y,.56,o.r,baseColor,o.m,o.n));
  }
  return out;
}

function puzzlePiece(x:number,y:number,size:number,bg:string,band:string,lineMode:'diag'|'anti'|'flat',stripePos:'left'|'mid'|'right') {
  const stripeX = stripePos==='left'?x+size*.22:stripePos==='right'?x+size*.78:x+size*.5;
  const line = lineMode==='diag'
    ? `<path d="M${x} ${y} L${x+size} ${y+size}" stroke="${band}" stroke-width="10" stroke-linecap="round"/>`
    : lineMode==='anti'
      ? `<path d="M${x+size} ${y} L${x} ${y+size}" stroke="${band}" stroke-width="10" stroke-linecap="round"/>`
      : `<path d="M${x} ${y+size*.5} L${x+size} ${y+size*.5}" stroke="${band}" stroke-width="10" stroke-linecap="round"/>`;
  return `<g><rect x="${x}" y="${y}" width="${size}" height="${size}" rx="7" fill="${bg}" stroke="#475569" stroke-width="2"/>${line}<path d="M${stripeX} ${y} L${stripeX} ${y+size}" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/></g>`;
}

function partWhole(activity:VisualPerceptionActivity, random:()=>number) {
  const questions=4; let out=text(W/2,232,'أي قطعة تكمل الخطوط المستمرة في الشكل الكبير؟',21,800,'#C2410C');
  for(let q=0;q<questions;q++){
    const y=315+q*160; const size=52; const gx=85, gy=y-50;
    const bg=palette[(q+activity.level)%palette.length], band=palette[(q+3)%palette.length];
    out+=`<rect x="45" y="${y-72}" width="704" height="140" rx="18" fill="#FFF7ED" stroke="#FED7AA"/>`;
    out+=puzzlePiece(gx,gy,size,bg,band,'diag','right');
    out+=puzzlePiece(gx+size,gy,size,bg,band,'diag','mid');
    out+=puzzlePiece(gx,gy+size,size,bg,band,'diag','right');
    out+=`<rect x="${gx+size}" y="${gy+size}" width="${size}" height="${size}" rx="7" fill="#fff" stroke="#FB923C" stroke-width="3" stroke-dasharray="6 5"/>`;
    out+=text(225,y+10,'اختر:',16,800,'#C2410C');
    const opts=shuffle([
      {mode:'diag' as const,pos:'mid' as const},
      {mode:'anti' as const,pos:'mid' as const},
      {mode:'diag' as const,pos:'left' as const}
    ],random);
    opts.forEach((o,i)=>out+=puzzlePiece(330+i*130,y-30,62,bg,band,o.mode,o.pos));
  }
  return out;
}

export function renderVisualPerceptionWorksheet(activity:VisualPerceptionActivity) {
  const random=rng(activity.seed);
  let body='';
  if(activity.taskType==='visual-discrimination') body=discrimination(activity,random);
  else if(activity.taskType==='figure-ground') body=figureGround(activity,random);
  else if(activity.taskType==='visual-closure') body=closure(activity,random);
  else if(activity.taskType==='spatial-relations') body=spatial(activity,random);
  else if(activity.taskType==='form-constancy') body=formConstancy(activity,random);
  else if(activity.taskType==='mental-rotation') body=mentalRotation(activity,random);
  else body=partWhole(activity,random);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(activity.seriesTitle)} - ${esc(activity.label)}">${header(activity)}${body}${footer(activity)}</svg>`;
}