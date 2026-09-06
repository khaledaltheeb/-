import type { MathLogicActivity } from './math-logic-lab';

const W=794,H=1123;
const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const rand=(seed:number)=>{let x=seed>>>0;return()=>((x=(x*1664525+1013904223)>>>0)/4294967296)};
const palette=['#2563EB','#E11D48','#059669','#7C3AED','#D97706'];
const shape=(kind:number,x:number,y:number,size:number,color:string,fill=true)=>{
 const f=fill?color:'white',s=`stroke="${color}" stroke-width="4"`;
 if(kind%5===0)return`<circle cx="${x}" cy="${y}" r="${size/2}" fill="${f}" ${s}/>`;
 if(kind%5===1)return`<rect x="${x-size/2}" y="${y-size/2}" width="${size}" height="${size}" rx="6" fill="${f}" ${s}/>`;
 if(kind%5===2)return`<polygon points="${x},${y-size/2} ${x-size/2},${y+size/2} ${x+size/2},${y+size/2}" fill="${f}" ${s}/>`;
 if(kind%5===3)return`<polygon points="${x},${y-size/2} ${x-size/2},${y} ${x},${y+size/2} ${x+size/2},${y}" fill="${f}" ${s}/>`;
 const pts=Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5,r=i%2?size*.22:size*.48;return`${x+Math.cos(a)*r},${y+Math.sin(a)*r}`}).join(' ');
 return`<polygon points="${pts}" fill="${f}" ${s}/>`;
};
const header=(a:MathLogicActivity)=>`<rect width="${W}" height="${H}" fill="#FFFDF7"/><rect x="32" y="28" width="730" height="112" rx="24" fill="#F8FAFC" stroke="#CBD5E1"/><text x="730" y="68" text-anchor="end" font-family="Arial,sans-serif" font-size="26" font-weight="700" fill="#0F172A">${esc(a.seriesTitle)}</text><text x="730" y="104" text-anchor="end" font-family="Arial,sans-serif" font-size="18" fill="#334155">${esc(a.label)} · المستوى ${a.level}</text><rect x="45" y="50" width="105" height="62" rx="18" fill="${a.kind==='test'?'#FEF3C7':'#DBEAFE'}"/><text x="98" y="87" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" font-weight="700" fill="#1E3A8A">${a.kind==='test'?'اختبار':'تدريب'}</text><text x="730" y="176" text-anchor="end" font-family="Arial,sans-serif" font-size="19" fill="#0F172A">${esc(a.instruction)}</text>`;
const footer=(a:MathLogicActivity)=>`<line x1="42" y1="1032" x2="752" y2="1032" stroke="#CBD5E1"/><text x="735" y="1065" text-anchor="end" font-family="Arial,sans-serif" font-size="15" fill="#475569">الاسم: __________   التاريخ: __________</text><text x="58" y="1092" font-family="Arial,sans-serif" font-size="13" fill="#64748B">${a.kind==='test'?'اختبار إتقان تعليمي - غير تشخيصي':'تدريب متدرج - الدقة قبل السرعة'}</text>`;

function patterns(a:MathLogicActivity){
 const r=rand(a.seed),rows=a.level>=4?3:2,unit=a.level===1?2:a.level===2?3:a.level===3?3:4,seqLen=a.level===5?10:8;let out='';
 for(let row=0;row<rows;row++){
  const y=300+row*220,baseShape=Math.floor(r()*5),baseColor=Math.floor(r()*palette.length);
  out+=`<rect x="55" y="${y-75}" width="684" height="150" rx="24" fill="#FFFFFF" stroke="#CBD5E1"/>`;
  for(let i=0;i<seqLen;i++){
   const x=105+i*72,blank=i>=seqLen-(a.level===5?2:1);
   if(blank){out+=`<rect x="${x-25}" y="${y-25}" width="50" height="50" rx="9" fill="#FFF" stroke="#94A3B8" stroke-width="3" stroke-dasharray="7 6"/>`;continue;}
   const p=i%unit,kind=a.level>=3?(baseShape+p)%5:baseShape,color=a.level>=4?palette[(baseColor+p)%palette.length]:palette[(baseColor+(a.level===1?p%2:p))%palette.length];
   out+=shape(kind,x,y,42,color);
  }
  out+=`<text x="710" y="${y+58}" text-anchor="end" font-family="Arial,sans-serif" font-size="15" fill="#64748B">اكتشف الوحدة المتكررة ثم أكمل</text>`;
 }
 return out;
}
function classification(a:MathLogicActivity){
 const r=rand(a.seed),count=a.level<3?12:16,targetKind=Math.floor(r()*5),targetColor=Math.floor(r()*palette.length),two=a.level>=4;let out=`<rect x="55" y="230" width="684" height="690" rx="26" fill="#FFF" stroke="#CBD5E1"/><text x="710" y="270" text-anchor="end" font-family="Arial,sans-serif" font-size="18" font-weight="700" fill="#0F172A">القاعدة: ${two?'اختر الشكل الصحيح واللون الصحيح معًا':a.level===1?'اختر الشكل المطابق':'اختر حسب القاعدة المطلوبة'}</text>`;
 for(let i=0;i<count;i++){
  const col=i%4,row=Math.floor(i/4),x=145+col*155,y=365+row*135,correct=i%4===0,kind=correct?targetKind:(targetKind+1+Math.floor(r()*4))%5,color=correct?palette[targetColor]:palette[(targetColor+1+Math.floor(r()*4))%palette.length];
  out+=shape(kind,x,y,58,color,a.level!==2||i%3!==0)+`<circle cx="${x}" cy="${y+48}" r="9" fill="none" stroke="#94A3B8" stroke-width="2"/>`;
 }
 return out;
}
function quantity(a:MathLogicActivity){
 const r=rand(a.seed),groups=a.level===5?3:2,base=2+a.level;let out='';
 for(let g=0;g<groups;g++){
  const x=65+g*(groups===3?235:340),w=groups===3?205:310,y=270,h=550,n=base+g+(a.level>=4&&g===0?2:0)-(a.level>=4&&g===1?1:0),big=a.level>=4&&g===1;
  out+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="28" fill="#FFF" stroke="#CBD5E1"/><text x="${x+w/2}" y="${y+45}" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" font-weight="700" fill="#334155">المجموعة ${['أ','ب','ج'][g]}</text>`;
  for(let i=0;i<n;i++){
   const cols=groups===3?3:4,cx=x+45+(i%cols)*(groups===3?55:65)+(r()-.5)*12,cy=y+115+Math.floor(i/cols)*75+(r()-.5)*12,size=big?42:28;
   out+=shape((g+i)%5,cx,cy,size,palette[g%palette.length]);
  }
 }
 out+=`<text x="397" y="875" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" font-weight="700" fill="#0F172A">${a.level<3?'ضع دائرة حول المجموعة الأكثر':'قارن العدد، لا حجم الشكل ولا مساحة انتشاره'}</text>`;
 return out;
}
function ordering(a:MathLogicActivity){
 const n=Math.min(3+a.level,7),r=rand(a.seed),vals=Array.from({length:n},(_,i)=>i+1).sort(()=>r()-.5),cardW=90,gap=15,start=(W-(n*cardW+(n-1)*gap))/2;let out=`<text x="397" y="250" text-anchor="middle" font-family="Arial,sans-serif" font-size="20" font-weight="700" fill="#0F172A">رتب البطاقات من الأصغر إلى الأكبر</text>`;
 vals.forEach((v,i)=>{const x=start+i*(cardW+gap),y=315,size=24+v*8;out+=`<rect x="${x}" y="${y}" width="${cardW}" height="180" rx="20" fill="#FFF" stroke="#CBD5E1"/>${shape(i%5,x+cardW/2,y+78,size,palette[i%palette.length])}<text x="${x+cardW/2}" y="${y+150}" text-anchor="middle" font-family="Arial,sans-serif" font-size="18" fill="#475569">${String.fromCharCode(0x0623+i)}</text>`});
 out+=`<rect x="75" y="600" width="644" height="190" rx="24" fill="#F8FAFC" stroke="#CBD5E1"/><text x="690" y="640" text-anchor="end" font-family="Arial,sans-serif" font-size="18" fill="#334155">اكتب ترتيب الحروف هنا:</text>${Array.from({length:n},(_,i)=>`<rect x="${110+i*(560/n)}" y="685" width="${Math.min(70,500/n)}" height="62" rx="12" fill="#FFF" stroke="#94A3B8"/>`).join('')}`;
 return out;
}
function visualLogic(a:MathLogicActivity){
 const n=a.level>=4?4:3,r=rand(a.seed),symbols=[0,1,2,3],size=n===4?105:130,x0=(W-n*size)/2,y0=275,blankCount=a.level===1?1:a.level===2?2:a.level===3?3:a.level===4?4:6;
 const blanks=new Set<number>();while(blanks.size<blankCount)blanks.add(Math.floor(r()*n*n));let out=`<text x="397" y="235" text-anchor="middle" font-family="Arial,sans-serif" font-size="19" fill="#334155">لا يتكرر الرمز نفسه في أي صف أو عمود</text>`;
 for(let row=0;row<n;row++)for(let col=0;col<n;col++){
  const idx=row*n+col,x=x0+col*size,y=y0+row*size;out+=`<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="#FFF" stroke="#64748B" stroke-width="2"/>`;
  if(!blanks.has(idx)){const k=symbols[(row+col)%n];out+=shape(k,x+size/2,y+size/2,46,palette[k]);}
  else out+=`<circle cx="${x+size/2}" cy="${y+size/2}" r="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-dasharray="4 4"/>`;
 }
 out+=`<rect x="95" y="${y0+n*size+55}" width="604" height="120" rx="22" fill="#F8FAFC" stroke="#CBD5E1"/><text x="670" y="${y0+n*size+88}" text-anchor="end" font-family="Arial,sans-serif" font-size="16" fill="#475569">الرموز المتاحة</text>${Array.from({length:n},(_,i)=>shape(i,180+i*120,y0+n*size+125,40,palette[i])).join('')}`;
 return out;
}
export function renderMathLogicSvg(a:MathLogicActivity){const body=a.taskType==='patterns'?patterns(a):a.taskType==='classification'?classification(a):a.taskType==='quantity-comparison'?quantity(a):a.taskType==='ordering-sequencing'?ordering(a):visualLogic(a);return`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(a.title)}">${header(a)}${body}${footer(a)}</svg>`;}
