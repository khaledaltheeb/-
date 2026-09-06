import type { MathLogicActivity } from './math-logic-lab';

const W=794,H=1123;
const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const rand=(seed:number)=>{let x=seed>>>0;return()=>((x=(x*1664525+1013904223)>>>0)/4294967296)};
const shuffle=<T,>(items:T[],r:()=>number)=>{const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;};
const wrap=(s:string,n=60)=>{const words=s.split(/\s+/),out:string[]=[];let line='';for(const w of words){const q=line?`${line} ${w}`:w;if(q.length>n&&line){out.push(line);line=w}else line=q}if(line)out.push(line);return out.slice(0,2);};
const text=(x:number,y:number,s:string,size=18,weight=600,fill='#0F172A',anchor='middle')=>`<text x="${x}" y="${y}" text-anchor="${anchor}" direction="rtl" unicode-bidi="plaintext" font-family="Tahoma,Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}">${esc(s)}</text>`;
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
const header=(a:MathLogicActivity)=>{const lines=wrap(a.instruction,62);return `<rect width="${W}" height="${H}" fill="#FFFDF8"/><rect x="32" y="28" width="730" height="112" rx="24" fill="#F8FAFC" stroke="#CBD5E1"/>${text(730,68,a.seriesTitle,26,800,'#0F172A','end')}${text(730,104,`${a.label} · المستوى ${a.level}`,18,600,'#334155','end')}<rect x="45" y="50" width="105" height="62" rx="18" fill="${a.kind==='test'?'#FEF3C7':'#DBEAFE'}"/>${text(98,87,a.kind==='test'?'اختبار':'تدريب',18,800,'#1E3A8A')}<rect x="55" y="153" width="684" height="${lines.length>1?68:50}" rx="16" fill="#FFFFFF" stroke="#E2E8F0"/>${lines.map((l,i)=>text(710,184+i*24,l,16,600,'#334155','end')).join('')}`;};
const footer=(a:MathLogicActivity)=>`<line x1="42" y1="1032" x2="752" y2="1032" stroke="#CBD5E1"/>${text(735,1065,'الاسم: __________   التاريخ: __________',15,600,'#475569','end')}${text(58,1092,a.kind==='test'?'اختبار إتقان تعليمي - غير تشخيصي':'تدريب متدرج - الدقة قبل السرعة',13,500,'#64748B','start')}`;

function patterns(a:MathLogicActivity){
 const r=rand(a.seed),rows=a.level>=4?3:2,unit=a.level===1?2:a.level===2?3:a.level===3?3:4,seqLen=a.level===5?10:8;let out='';
 for(let row=0;row<rows;row++){
  const y=315+row*210,baseShape=Math.floor(r()*5),baseColor=Math.floor(r()*palette.length);
  out+=`<rect x="55" y="${y-72}" width="684" height="144" rx="24" fill="#FFFFFF" stroke="#CBD5E1"/>`;
  for(let i=0;i<seqLen;i++){
   const x=105+i*72,blank=i>=seqLen-(a.level===5?2:1);
   if(blank){out+=`<rect x="${x-25}" y="${y-25}" width="50" height="50" rx="9" fill="#FFF" stroke="#94A3B8" stroke-width="3" stroke-dasharray="7 6"/>`;continue;}
   const p=i%unit,kind=a.level>=3?(baseShape+p)%5:baseShape,color=a.level>=4?palette[(baseColor+p)%palette.length]:palette[(baseColor+(a.level===1?p%2:p))%palette.length];
   out+=shape(kind,x,y,42,color);
  }
  out+=text(710,y+56,'اكتشف الوحدة المتكررة ثم أكمل',15,500,'#64748B','end');
 }
 return out;
}
function classification(a:MathLogicActivity){
 const r=rand(a.seed),count=a.level<3?12:16,targetKind=Math.floor(r()*5),targetColor=Math.floor(r()*palette.length),two=a.level>=4,targetCount=a.level<3?3:4;
 const correctSet=new Set(shuffle(Array.from({length:count},(_,i)=>i),r).slice(0,targetCount));
 let out=`<rect x="55" y="245" width="684" height="675" rx="26" fill="#FFF" stroke="#CBD5E1"/>${text(710,285,`القاعدة: ${two?'اختر الشكل الصحيح واللون الصحيح معًا':a.level===1?'اختر الشكل المطابق':'اختر حسب القاعدة المطلوبة'}`,18,800,'#0F172A','end')}`;
 for(let i=0;i<count;i++){
  const col=i%4,row=Math.floor(i/4),x=145+col*155,y=375+row*130,correct=correctSet.has(i),kind=correct?targetKind:(targetKind+1+Math.floor(r()*4))%5,color=correct?palette[targetColor]:palette[(targetColor+1+Math.floor(r()*4))%palette.length];
  out+=shape(kind,x,y,58,color,a.level!==2||i%3!==0)+`<circle cx="${x}" cy="${y+48}" r="9" fill="none" stroke="#94A3B8" stroke-width="2"/>`;
 }
 return out;
}
function quantity(a:MathLogicActivity){
 const r=rand(a.seed),groups=a.level===5?3:2,base=2+a.level;let out='';
 for(let g=0;g<groups;g++){
  const x=65+g*(groups===3?235:340),w=groups===3?205:310,y=275,h=545,n=base+g+(a.level>=4&&g===0?2:0)-(a.level>=4&&g===1?1:0),big=a.level>=4&&g===1;
  out+=`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="28" fill="#FFF" stroke="#CBD5E1"/>${text(x+w/2,y+45,`المجموعة ${['أ','ب','ج'][g]}`,20,800,'#334155')}`;
  for(let i=0;i<n;i++){
   const cols=groups===3?3:4,cx=x+45+(i%cols)*(groups===3?55:65)+(r()-.5)*12,cy=y+115+Math.floor(i/cols)*75+(r()-.5)*12,size=big?42:28;
   out+=shape((g+i)%5,cx,cy,size,palette[g%palette.length]);
  }
 }
 out+=text(397,875,a.level<3?'ضع دائرة حول المجموعة الأكثر':'قارن العدد، لا حجم الشكل ولا مساحة انتشاره',20,800,'#0F172A');
 return out;
}
function ordering(a:MathLogicActivity){
 const n=Math.min(3+a.level,7),r=rand(a.seed),vals=shuffle(Array.from({length:n},(_,i)=>i+1),r),cardW=90,gap=15,start=(W-(n*cardW+(n-1)*gap))/2;let out=text(397,255,'رتب البطاقات من الأصغر إلى الأكبر',20,800,'#0F172A');
 vals.forEach((v,i)=>{const x=start+i*(cardW+gap),y=320,size=24+v*8;out+=`<rect x="${x}" y="${y}" width="${cardW}" height="180" rx="20" fill="#FFF" stroke="#CBD5E1"/>${shape(i%5,x+cardW/2,y+78,size,palette[i%palette.length])}${text(x+cardW/2,y+150,String.fromCharCode(0x0623+i),18,500,'#475569')}`});
 out+=`<rect x="75" y="600" width="644" height="190" rx="24" fill="#F8FAFC" stroke="#CBD5E1"/>${text(690,640,'اكتب ترتيب الحروف هنا:',18,600,'#334155','end')}${Array.from({length:n},(_,i)=>`<rect x="${110+i*(560/n)}" y="685" width="${Math.min(70,500/n)}" height="62" rx="12" fill="#FFF" stroke="#94A3B8"/>`).join('')}`;
 return out;
}
function logicBlanks(level:number,seed:number,n:number){
 const base=level===1?[4]:level===2?[1,7]:level===3?[0,4,8]:level===4?[0,5,10,15]:[0,5,10,15,1,6];
 const shift=seed%(n*n);return new Set(base.map(i=>{const row=Math.floor(i/n),col=i%n;const rowShift=Math.floor(shift/n)%n,colShift=shift%n;return ((row+rowShift)%n)*n+((col+colShift)%n);}));
}
function visualLogic(a:MathLogicActivity){
 const n=a.level>=4?4:3,symbols=[0,1,2,3],size=n===4?105:130,x0=(W-n*size)/2,y0=285,blanks=logicBlanks(a.level,a.seed,n);let out=text(397,245,'لا يتكرر الرمز نفسه في أي صف أو عمود',19,600,'#334155');
 for(let row=0;row<n;row++)for(let col=0;col<n;col++){
  const idx=row*n+col,x=x0+col*size,y=y0+row*size;out+=`<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="#FFF" stroke="#64748B" stroke-width="2"/>`;
  if(!blanks.has(idx)){const k=symbols[(row+col)%n];out+=shape(k,x+size/2,y+size/2,46,palette[k]);}
  else out+=`<circle cx="${x+size/2}" cy="${y+size/2}" r="10" fill="#F8FAFC" stroke="#CBD5E1" stroke-dasharray="4 4"/>`;
 }
 out+=`<rect x="95" y="${y0+n*size+55}" width="604" height="120" rx="22" fill="#F8FAFC" stroke="#CBD5E1"/>${text(670,y0+n*size+88,'الرموز المتاحة',16,500,'#475569','end')}${Array.from({length:n},(_,i)=>shape(i,180+i*120,y0+n*size+125,40,palette[i])).join('')}`;
 return out;
}
export function renderMathLogicSvg(a:MathLogicActivity){const body=a.taskType==='patterns'?patterns(a):a.taskType==='classification'?classification(a):a.taskType==='quantity-comparison'?quantity(a):a.taskType==='ordering-sequencing'?ordering(a):visualLogic(a);return`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(a.title)}">${header(a)}${body}${footer(a)}</svg>`;}
