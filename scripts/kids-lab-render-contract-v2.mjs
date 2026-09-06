import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import ts from 'typescript';

const ROOT=process.cwd();
const OUT=path.join(ROOT,'artifacts','kids-lab-qa');
const SAMPLE_OUT=path.join(OUT,'svg');
const SUSPECT_OUT=path.join(OUT,'suspects');
const nativeRequire=createRequire(import.meta.url);
const cache=new Map();

const domains=[
 ['attention','lib/capabilities/attention-lab.ts','lib/capabilities/attention-svg.ts','renderAttentionWorksheet',true],
 ['memory','lib/capabilities/memory-lab.ts','lib/capabilities/memory-svg.ts','renderMemoryWorksheet',true],
 ['executive','lib/capabilities/executive-functions-lab.ts','lib/capabilities/executive-functions-svg.ts','renderExecutiveWorksheet',true],
 ['visual-perception','lib/capabilities/visual-perception-lab.ts','lib/capabilities/visual-perception-svg.ts','renderVisualPerceptionWorksheet',true],
 ['visual-motor','lib/capabilities/visual-motor-lab.ts','lib/capabilities/visual-motor-svg.ts','renderVisualMotorWorksheet',true],
 ['fine-motor','lib/capabilities/fine-motor-lab.ts','lib/capabilities/fine-motor-svg.ts','renderFineMotorWorksheet',true],
 ['bilateral-43','lib/capabilities/bilateral-tracks.ts','lib/capabilities/bilateral-svg.ts','renderBilateralSvg',true,43],
 ['bilateral-44-47','lib/capabilities/bilateral-lab.ts','lib/capabilities/bilateral-lab-svg.ts','renderBilateralLabWorksheet',true],
 ['language-reading','lib/capabilities/language-reading-lab.ts','lib/capabilities/language-reading-svg.ts','renderLanguageReadingWorksheet',false],
 ['math-logic','lib/capabilities/math-logic-lab.ts','lib/capabilities/math-logic-svg.ts','renderMathLogicSvg',true],
 ['emotional-regulation','lib/capabilities/emotional-regulation-lab.ts','lib/capabilities/emotional-regulation-svg.ts','renderEmotionalRegulationSvg',false],
 ['social-skills','lib/capabilities/social-skills-lab.ts','lib/capabilities/social-skills-svg.ts','renderSocialSvg',false],
 ['sensory-self-regulation','lib/capabilities/sensory-self-regulation-lab.ts','lib/capabilities/sensory-self-regulation-svg.ts','renderSensorySelfSvg',false],
];

function resolveLocal(from,spec){
 let base;if(spec.startsWith('@/'))base=path.join(ROOT,spec.slice(2));else if(spec.startsWith('.'))base=path.resolve(path.dirname(from),spec);else return null;
 return [base,`${base}.ts`,`${base}.tsx`,`${base}.js`,`${base}.mjs`,path.join(base,'index.ts')].find(fs.existsSync)??null;
}
function loadTs(file){
 const abs=path.resolve(ROOT,file);if(cache.has(abs))return cache.get(abs).exports;
 const js=ts.transpileModule(fs.readFileSync(abs,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true,jsx:ts.JsxEmit.ReactJSX,moduleResolution:ts.ModuleResolutionKind.Node10},fileName:abs}).outputText;
 const rec={exports:{}};cache.set(abs,rec);
 const req=(spec)=>{const local=resolveLocal(abs,spec);return local?loadTs(local):nativeRequire(spec)};
 new Function('require','module','exports','__filename','__dirname',js)(req,rec,rec.exports,abs,path.dirname(abs));return rec.exports;
}
function activityArray(mod,key){
 const arrays=Object.values(mod).filter(v=>Array.isArray(v)&&v.length&&v.slice(0,5).every(x=>x&&typeof x==='object'&&typeof x.slug==='string'&&Number.isInteger(x.level)&&typeof x.kind==='string')).sort((a,b)=>b.length-a.length);
 if(!arrays.length)throw new Error(`No activity array for ${key}`);return arrays[0];
}
function canvas(svg){
 const vb=svg.match(/viewBox=["']\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)["']/i);if(vb)return{x:+vb[1],y:+vb[2],width:+vb[3],height:+vb[4]};
 const w=svg.match(/<svg\b[^>]*\bwidth=["'](\d+(?:\.\d+)?)["']/i),h=svg.match(/<svg\b[^>]*\bheight=["'](\d+(?:\.\d+)?)["']/i);return w&&h?{x:0,y:0,width:+w[1],height:+h[1]}:null;
}
function attr(tag,name){const m=tag.match(new RegExp(`\\b${name}=["'](-?\\d+(?:\\.\\d+)?)["']`,'i'));return m?+m[1]:null}
function yOf(tag){for(const n of ['y','cy','y1']){const v=attr(tag,n);if(v!==null)return v}const p=tag.match(/\bpoints=["']([^"']+)/i)?.[1]?.match(/-?\d+(?:\.\d+)?\s*,\s*(-?\d+(?:\.\d+)?)/);if(p)return+p[1];const d=tag.match(/\bd=["']([^"']+)/i)?.[1]?.match(/[MLCQ]\s*-?\d+(?:\.\d+)?\s*[, ]\s*(-?\d+(?:\.\d+)?)/i);return d?+d[1]:null}
function hash(s){return crypto.createHash('sha256').update(s).digest('hex')}
function taskTags(svg,c){
 const tags=svg.match(/<(?:rect|circle|ellipse|line|path|polygon|polyline|text)\b[^>]*>(?:[\s\S]*?<\/text>)?|<(?:rect|circle|ellipse|line|path|polygon|polyline)\b[^>]*\/?\s*>/gi)??[];
 return tags.filter(t=>{const y=yOf(t);return y===null||(y>=c.y+c.height*.20&&y<=c.y+c.height*.90)});
}
function geometryHash(svg,c){return hash(taskTags(svg,c).map(t=>t.replace(/<text\b[^>]*>[\s\S]*?<\/text>/gi,'').replace(/\b(?:fill|stroke)=["'][^"']+["']/gi,m=>`${m.split('=')[0]}="COLOR"`).replace(/\s+/g,' ').trim()).filter(Boolean).join('|'))}
function contentHash(svg,c){return hash(taskTags(svg,c).map(t=>t.replace(/\s+/g,' ').replace(/>\s+</g,'><').trim()).join('|'))}
function stripTags(s){return s.replace(/<[^>]+>/g,'').replace(/&(?:amp|lt|gt|quot|apos|#\d+);/g,'x').trim()}
function inspect(svg,id){
 const failures=[],warnings=[];if(typeof svg!=='string'||!svg.includes('<svg')||!svg.includes('</svg>'))failures.push(`${id}: invalid SVG envelope`);if(/\b(?:NaN|Infinity|undefined)\b/.test(svg))failures.push(`${id}: contains NaN/Infinity/undefined`);
 const c=canvas(svg);if(!c){failures.push(`${id}: missing numeric canvas`);return{failures,warnings,c:null}}
 const tx=Math.max(80,c.width*.08),ty=Math.max(80,c.height*.06);for(const tag of svg.match(/<(?:rect|circle|ellipse|line|text)\b[^>]*>/gi)??[]){
  for(const n of ['x','cx','x1','x2']){const v=attr(tag,n);if(v!==null&&(v<c.x-tx||v>c.x+c.width+tx))failures.push(`${id}: ${n}=${v} outside horizontal canvas tolerance`)}
  for(const n of ['y','cy','y1','y2']){const v=attr(tag,n);if(v!==null&&(v<c.y-ty||v>c.y+c.height+ty))failures.push(`${id}: ${n}=${v} outside vertical canvas tolerance`)}
  if(tag.startsWith('<rect')){const x=attr(tag,'x'),y=attr(tag,'y'),w=attr(tag,'width'),h=attr(tag,'height');if(x!==null&&w!==null&&x+w>c.x+c.width+tx)failures.push(`${id}: rect exceeds right canvas tolerance`);if(y!==null&&h!==null&&y+h>c.y+c.height+ty)failures.push(`${id}: rect exceeds bottom canvas tolerance`)}
 }
 for(const tag of svg.match(/<text\b[^>]*>[\s\S]*?<\/text>/gi)??[]){const value=stripTags(tag);if(!value)continue;const y=attr(tag,'y');if(y!==null&&y>c.y+c.height-8)warnings.push(`${id}: text baseline near bottom (${y})`);if(/[\u0600-\u06FF]/.test(value)&&!/\bdirection=["']rtl["']/i.test(tag))warnings.push(`${id}: Arabic text without explicit rtl: ${value.slice(0,45)}`);const x=attr(tag,'x'),font=attr(tag,'font-size')??16;if(x!==null){const anchor=tag.match(/text-anchor=["'](start|middle|end)["']/i)?.[1]??'start';const available=anchor==='middle'?2*Math.min(x-c.x,c.x+c.width-x):anchor==='end'?x-c.x:c.x+c.width-x;const estimate=value.length*font*.55;if(available>0&&estimate>available*1.28)warnings.push(`${id}: possible long text line: ${value.slice(0,60)}`)}}
 if(!/(role=["']img["']|aria-label=|aria-labelledby=|<title\b)/i.test(svg))warnings.push(`${id}: SVG lacks accessible name/title`);return{failures,warnings,c};
}
function safe(s){return String(s).replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,80)||'item'}
function sample(items,level,kind){return items.find(x=>x.level===level&&x.kind===kind)}

fs.rmSync(OUT,{recursive:true,force:true});fs.mkdirSync(SAMPLE_OUT,{recursive:true});fs.mkdirSync(SUSPECT_OUT,{recursive:true});
const failures=[],warnings=[],rendered=[],series=new Map(),domainStats=[];
for(const [key,dataPath,svgPath,renderName,geometry,fixed] of domains){
 const data=loadTs(dataPath),svgMod=loadTs(svgPath),items=activityArray(data,key),render=svgMod[renderName];if(typeof render!=='function')throw new Error(`Missing ${renderName}`);let tests=0;
 for(const activity of items){const number=Number.isInteger(activity.seriesNumber)?activity.seriesNumber:fixed;if(!Number.isInteger(number))throw new Error(`Missing series number ${key}/${activity.slug}`);const slug=activity.seriesSlug??(number===43?'bilateral-tracks':key),id=`${key}/${number}/${slug}/${activity.slug}`;let svg;try{svg=render(activity)}catch(e){failures.push(`${id}: renderer threw ${e instanceof Error?e.message:String(e)}`);continue}const check=inspect(svg,id);failures.push(...check.failures);warnings.push(...check.warnings);const row={domain:key,number,seriesSlug:slug,title:activity.seriesTitle??activity.title??slug,slug:activity.slug,level:activity.level,kind:activity.kind,svg,geometryHash:geometry&&check.c?geometryHash(svg,check.c):null,contentHash:check.c?contentHash(svg,check.c):null};rendered.push(row);if(activity.kind==='test')tests++;if(!series.has(number))series.set(number,{number,domain:key,slug,title:row.title,items:[]});series.get(number).items.push(row)}domainStats.push({domain:key,items:items.length,tests});
}
if(rendered.length!==1000)failures.push(`Expected 1000 items; found ${rendered.length}`);if(series.size!==67)failures.push(`Expected 67 series; found ${series.size}`);const allTests=rendered.filter(x=>x.kind==='test').length;if(allTests!==335)failures.push(`Expected 335 mastery tests; found ${allTests}`);
for(let n=1;n<=67;n++)if(!series.has(n))failures.push(`Missing series ${n}`);
let geometryMatches=0,contentMatches=0;
for(const s of [...series.values()].sort((a,b)=>a.number-b.number)){
 const levels=[...new Set(s.items.map(x=>x.level))].sort((a,b)=>a-b);if(levels.join(',')!=='1,2,3,4,5')failures.push(`Series ${s.number}: levels ${levels.join(',')}`);if(s.items.filter(x=>x.kind==='test').length!==5)failures.push(`Series ${s.number}: mastery test count != 5`);
 const dir=path.join(SAMPLE_OUT,`${String(s.number).padStart(2,'0')}-${safe(s.slug)}`);fs.mkdirSync(dir,{recursive:true});for(const it of [sample(s.items,1,'training-a')??s.items.find(x=>x.level===1),sample(s.items,3,'training-b')??sample(s.items,3,'training-a'),sample(s.items,5,'test')].filter(Boolean))fs.writeFileSync(path.join(dir,`${safe(it.slug)}.svg`),it.svg);
 for(let level=1;level<=5;level++){
  const same=s.items.filter(x=>x.level===level),test=same.find(x=>x.kind==='test'),train=same.filter(x=>x.kind!=='test');if(!test){failures.push(`Series ${s.number} level ${level}: missing mastery test`);continue}
  const exact=train.find(x=>x.contentHash===test.contentHash);if(exact){contentMatches++;failures.push(`Series ${s.number} level ${level}: mastery test task content is identical to ${exact.kind}`)}
  const geom=train.find(x=>x.geometryHash&&x.geometryHash===test.geometryHash);if(geom){geometryMatches++;warnings.push(`Series ${s.number} level ${level}: shared task geometry with ${geom.kind}; content differs`);const sd=path.join(SUSPECT_OUT,`series-${String(s.number).padStart(2,'0')}-level-${level}`);fs.mkdirSync(sd,{recursive:true});fs.writeFileSync(path.join(sd,`${geom.kind}.svg`),geom.svg);fs.writeFileSync(path.join(sd,'test.svg'),test.svg)}
 }
}
for(const [n,slug,a] of [[37,'basic-lines','level-1-training-b'],[54,'patterns','level-1-training-b'],[60,'body-signals','level-1-training-b'],[63,'social-cues','level-1-training-b'],[66,'what-helps-me','level-1-training-b']])if(series.get(n)?.items.some(x=>x.seriesSlug===slug&&x.slug===a))failures.push(`Curated-out item present: ${n}/${slug}/${a}`);
const report={generatedAt:new Date().toISOString(),summary:{items:rendered.length,series:series.size,tests:allTests,contentMatches,geometryMatches,failures:failures.length,warnings:warnings.length},domains:domainStats,series:[...series.values()].sort((a,b)=>a.number-b.number).map(s=>({number:s.number,domain:s.domain,slug:s.slug,title:s.title,items:s.items.length,tests:s.items.filter(x=>x.kind==='test').length})),failures,warnings};fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));fs.writeFileSync(path.join(OUT,'report.md'),['# Kids Lab render QA v2','',`- Items: **${rendered.length}**`,`- Series: **${series.size}**`,`- Mastery tests: **${allTests}**`,`- Exact task-content matches: **${contentMatches}**`,`- Shared-geometry warnings: **${geometryMatches}**`,`- Failures: **${failures.length}**`,`- Warnings: **${warnings.length}**`,'','## Failures',...(failures.length?failures.map(x=>`- ${x}`):['- None']),'','## First 150 warnings',...warnings.slice(0,150).map(x=>`- ${x}`)].join('\n'));console.log(`Kids Lab QA v2: ${rendered.length} items, ${series.size} series, ${allTests} tests, ${contentMatches} exact content matches, ${geometryMatches} shared-geometry warnings, ${failures.length} failures, ${warnings.length} warnings.`);if(failures.length){console.error(failures.slice(0,100).join('\n'));process.exit(1)}
