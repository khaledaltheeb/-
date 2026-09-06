import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import ts from 'typescript';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'artifacts', 'kids-lab-qa');
const SVG_OUT = path.join(OUT, 'svg');
const nativeRequire = createRequire(import.meta.url);
const moduleCache = new Map();

const domains = [
  { key:'attention', data:'lib/capabilities/attention-lab.ts', svg:'lib/capabilities/attention-svg.ts', render:'renderAttentionWorksheet', geometry:true },
  { key:'memory', data:'lib/capabilities/memory-lab.ts', svg:'lib/capabilities/memory-svg.ts', render:'renderMemoryWorksheet', geometry:true },
  { key:'executive', data:'lib/capabilities/executive-functions-lab.ts', svg:'lib/capabilities/executive-functions-svg.ts', render:'renderExecutiveWorksheet', geometry:true },
  { key:'visual-perception', data:'lib/capabilities/visual-perception-lab.ts', svg:'lib/capabilities/visual-perception-svg.ts', render:'renderVisualPerceptionWorksheet', geometry:true },
  { key:'visual-motor', data:'lib/capabilities/visual-motor-lab.ts', svg:'lib/capabilities/visual-motor-svg.ts', render:'renderVisualMotorWorksheet', geometry:true },
  { key:'fine-motor', data:'lib/capabilities/fine-motor-lab.ts', svg:'lib/capabilities/fine-motor-svg.ts', render:'renderFineMotorWorksheet', geometry:true },
  { key:'bilateral-43', data:'lib/capabilities/bilateral-tracks.ts', svg:'lib/capabilities/bilateral-svg.ts', render:'renderBilateralSvg', geometry:true, fixedSeries:43 },
  { key:'bilateral-44-47', data:'lib/capabilities/bilateral-lab.ts', svg:'lib/capabilities/bilateral-lab-svg.ts', render:'renderBilateralLabWorksheet', geometry:true },
  { key:'language-reading', data:'lib/capabilities/language-reading-lab.ts', svg:'lib/capabilities/language-reading-svg.ts', render:'renderLanguageReadingWorksheet', geometry:false },
  { key:'math-logic', data:'lib/capabilities/math-logic-lab.ts', svg:'lib/capabilities/math-logic-svg.ts', render:'renderMathLogicSvg', geometry:true },
  { key:'emotional-regulation', data:'lib/capabilities/emotional-regulation-lab.ts', svg:'lib/capabilities/emotional-regulation-svg.ts', render:'renderEmotionalRegulationSvg', geometry:false },
  { key:'social-skills', data:'lib/capabilities/social-skills-lab.ts', svg:'lib/capabilities/social-skills-svg.ts', render:'renderSocialSvg', geometry:false },
  { key:'sensory-self-regulation', data:'lib/capabilities/sensory-self-regulation-lab.ts', svg:'lib/capabilities/sensory-self-regulation-svg.ts', render:'renderSensorySelfSvg', geometry:false },
];

function resolveModule(fromFile, specifier) {
  let base;
  if (specifier.startsWith('@/')) base = path.join(ROOT, specifier.slice(2));
  else if (specifier.startsWith('.')) base = path.resolve(path.dirname(fromFile), specifier);
  else return null;
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.mjs`, path.join(base, 'index.ts')];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function loadTsModule(file) {
  const absolute = path.resolve(ROOT, file);
  if (moduleCache.has(absolute)) return moduleCache.get(absolute).exports;
  const source = fs.readFileSync(absolute, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      moduleResolution: ts.ModuleResolutionKind.Node10,
    },
    fileName: absolute,
  }).outputText;
  const record = { exports: {} };
  moduleCache.set(absolute, record);
  const localRequire = (specifier) => {
    const resolved = resolveModule(absolute, specifier);
    if (resolved) return loadTsModule(resolved);
    return nativeRequire(specifier);
  };
  const fn = new Function('require','module','exports','__filename','__dirname', compiled);
  fn(localRequire, record, record.exports, absolute, path.dirname(absolute));
  return record.exports;
}

function findActivities(exportsObject, domainKey) {
  const candidates = Object.entries(exportsObject)
    .filter(([, value]) => Array.isArray(value) && value.length > 0)
    .filter(([, value]) => value.slice(0, Math.min(5, value.length)).every((item) => item && typeof item === 'object' && typeof item.slug === 'string' && Number.isInteger(item.level) && typeof item.kind === 'string'))
    .sort((a,b) => b[1].length - a[1].length);
  if (!candidates.length) throw new Error(`No activity array found for ${domainKey}`);
  return candidates[0][1];
}

function seriesNumber(item, domain) {
  if (Number.isInteger(item.seriesNumber)) return item.seriesNumber;
  if (Number.isInteger(domain.fixedSeries)) return domain.fixedSeries;
  throw new Error(`Missing seriesNumber for ${domain.key}/${item.slug}`);
}

function parseCanvas(svg) {
  const viewBox = svg.match(/viewBox=["']\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)["']/i);
  if (viewBox) return { x:Number(viewBox[1]), y:Number(viewBox[2]), width:Number(viewBox[3]), height:Number(viewBox[4]) };
  const width = svg.match(/<svg\b[^>]*\bwidth=["'](\d+(?:\.\d+)?)["']/i);
  const height = svg.match(/<svg\b[^>]*\bheight=["'](\d+(?:\.\d+)?)["']/i);
  if (width && height) return { x:0, y:0, width:Number(width[1]), height:Number(height[1]) };
  return null;
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}=["'](-?\\d+(?:\\.\\d+)?)["']`, 'i'));
  return match ? Number(match[1]) : null;
}

function representativeY(tag) {
  for (const name of ['y','cy','y1']) {
    const value = attr(tag, name);
    if (value !== null) return value;
  }
  if (tag.startsWith('<line')) {
    const y1=attr(tag,'y1'), y2=attr(tag,'y2');
    if (y1!==null && y2!==null) return (y1+y2)/2;
  }
  const points = tag.match(/\bpoints=["']([^"']+)["']/i)?.[1];
  if (points) {
    const first = points.trim().match(/-?\d+(?:\.\d+)?\s*,\s*(-?\d+(?:\.\d+)?)/);
    if (first) return Number(first[1]);
  }
  const d = tag.match(/\bd=["']([^"']+)["']/i)?.[1];
  if (d) {
    const first = d.match(/[MLCQ]\s*-?\d+(?:\.\d+)?\s*[, ]\s*(-?\d+(?:\.\d+)?)/i);
    if (first) return Number(first[1]);
  }
  return null;
}

function geometryFingerprint(svg, canvas) {
  const tags = svg.match(/<(?:rect|circle|ellipse|line|path|polygon)\b[^>]*\/?\s*>/gi) ?? [];
  const body = tags.filter((tag) => {
    const y = representativeY(tag);
    return y === null || (y >= canvas.height * 0.20 && y <= canvas.height * 0.90);
  }).map((tag) => tag
    .replace(/\b(?:fill|stroke)=["'][^"']+["']/gi, (m) => `${m.split('=')[0]}="COLOR"`)
    .replace(/\s+/g,' ')
    .trim()
  ).join('|');
  return crypto.createHash('sha256').update(body).digest('hex');
}

function stripTags(text) {
  return text.replace(/<[^>]+>/g,'').replace(/&(?:amp|lt|gt|quot|apos|#\d+);/g,'x').trim();
}

function inspectSvg(svg, id, geometryRequired) {
  const failures=[]; const warnings=[];
  if (typeof svg !== 'string' || !svg.includes('<svg') || !svg.includes('</svg>')) failures.push(`${id}: invalid SVG envelope`);
  if (/\b(?:NaN|Infinity|undefined)\b/.test(svg)) failures.push(`${id}: contains NaN/Infinity/undefined`);
  const canvas=parseCanvas(svg);
  if (!canvas) return { failures:[...failures, `${id}: missing numeric viewBox/width+height`], warnings, fingerprint:null, canvas:null };
  if (canvas.width < 500 || canvas.height < 700) warnings.push(`${id}: unusually small canvas ${canvas.width}x${canvas.height}`);

  const toleranceX=Math.max(80,canvas.width*.08), toleranceY=Math.max(80,canvas.height*.06);
  const numericTags=svg.match(/<(?:rect|circle|ellipse|line|text)\b[^>]*>/gi) ?? [];
  for (const tag of numericTags) {
    for (const name of ['x','cx','x1','x2']) {
      const value=attr(tag,name); if(value!==null && (value < canvas.x-toleranceX || value > canvas.x+canvas.width+toleranceX)) failures.push(`${id}: ${name}=${value} outside horizontal canvas tolerance`);
    }
    for (const name of ['y','cy','y1','y2']) {
      const value=attr(tag,name); if(value!==null && (value < canvas.y-toleranceY || value > canvas.y+canvas.height+toleranceY)) failures.push(`${id}: ${name}=${value} outside vertical canvas tolerance`);
    }
    if (tag.startsWith('<rect')) {
      const x=attr(tag,'x'),y=attr(tag,'y'),w=attr(tag,'width'),h=attr(tag,'height');
      if(x!==null&&w!==null&&x+w>canvas.x+canvas.width+toleranceX) failures.push(`${id}: rect exceeds right canvas tolerance`);
      if(y!==null&&h!==null&&y+h>canvas.y+canvas.height+toleranceY) failures.push(`${id}: rect exceeds bottom canvas tolerance`);
    }
  }

  const textTags=svg.match(/<text\b[^>]*>[\s\S]*?<\/text>/gi) ?? [];
  for (const tag of textTags) {
    const value=stripTags(tag); if(!value) continue;
    const y=attr(tag,'y');
    if(y!==null && y>canvas.height-8) warnings.push(`${id}: text baseline near/below bottom edge (${y})`);
    if(/[\u0600-\u06FF]/.test(value) && !/\bdirection=["']rtl["']/i.test(tag)) warnings.push(`${id}: Arabic text without explicit direction=rtl: ${value.slice(0,45)}`);
    const x=attr(tag,'x'), font=attr(tag,'font-size') ?? 16;
    if(x!==null){
      const anchor=tag.match(/text-anchor=["'](start|middle|end)["']/i)?.[1] ?? 'start';
      const available=anchor==='middle'?2*Math.min(x-canvas.x,canvas.x+canvas.width-x):anchor==='end'?x-canvas.x:canvas.x+canvas.width-x;
      const estimated=value.length*font*0.55;
      if(available>0 && estimated>available*1.28) warnings.push(`${id}: possible long text line (${Math.round(estimated)}px est > ${Math.round(available)}px available): ${value.slice(0,60)}`);
    }
  }

  if(!/(role=["']img["']|aria-label=|aria-labelledby=|<title\b)/i.test(svg)) warnings.push(`${id}: SVG lacks role/img accessible name/title`);
  return { failures, warnings, fingerprint: geometryRequired?geometryFingerprint(svg,canvas):null, canvas };
}

function safe(value){return String(value).replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,90) || 'item';}
function chooseSamples(items){
  const pick=(level,kind)=>items.find((a)=>a.level===level&&a.kind===kind);
  return [pick(1,'training-a') ?? items.find(a=>a.level===1), pick(3,'training-b') ?? pick(3,'training-a') ?? items.find(a=>a.level===3), pick(5,'test') ?? items.find(a=>a.level===5)].filter(Boolean);
}

fs.rmSync(OUT,{recursive:true,force:true}); fs.mkdirSync(SVG_OUT,{recursive:true});
const failures=[]; const warnings=[]; const rendered=[]; const seriesMap=new Map(); const domainStats=[];

for(const domain of domains){
  const data=loadTsModule(domain.data); const rendererModule=loadTsModule(domain.svg); const activities=findActivities(data,domain.key); const render=rendererModule[domain.render];
  if(typeof render!=='function') throw new Error(`Missing renderer ${domain.render} in ${domain.svg}`);
  let tests=0;
  for(const activity of activities){
    const number=seriesNumber(activity,domain); const seriesSlug=activity.seriesSlug ?? (number===43?'bilateral-tracks':domain.key); const id=`${domain.key}/${number}/${seriesSlug}/${activity.slug}`;
    let svg;
    try{ svg=render(activity); }catch(error){ failures.push(`${id}: renderer threw ${error instanceof Error?error.message:String(error)}`); continue; }
    const inspection=inspectSvg(svg,id,domain.geometry); failures.push(...inspection.failures); warnings.push(...inspection.warnings);
    const entry={domain:domain.key,number,seriesSlug,title:activity.seriesTitle??activity.title??seriesSlug,slug:activity.slug,level:activity.level,kind:activity.kind,svg,fingerprint:inspection.fingerprint}; rendered.push(entry);
    if(activity.kind==='test')tests++;
    if(!seriesMap.has(number)) seriesMap.set(number,{number,domain:domain.key,seriesSlug,title:entry.title,items:[]});
    seriesMap.get(number).items.push(entry);
  }
  domainStats.push({domain:domain.key,items:activities.length,tests});
}

if(rendered.length!==1000) failures.push(`Expected exactly 1000 rendered items; found ${rendered.length}`);
if(seriesMap.size!==67) failures.push(`Expected exactly 67 series; found ${seriesMap.size}`);
const testTotal=rendered.filter((x)=>x.kind==='test').length;
if(testTotal!==335) failures.push(`Expected 335 mastery tests (67×5); found ${testTotal}`);

for(let n=1;n<=67;n++) if(!seriesMap.has(n)) failures.push(`Missing series ${n}`);
for(const series of [...seriesMap.values()].sort((a,b)=>a.number-b.number)){
  const levels=[...new Set(series.items.map(x=>x.level))].sort((a,b)=>a-b);
  if(levels.join(',')!=='1,2,3,4,5') failures.push(`Series ${series.number} missing level(s): ${levels.join(',')}`);
  const tests=series.items.filter(x=>x.kind==='test'); if(tests.length!==5) failures.push(`Series ${series.number} expected 5 tests; found ${tests.length}`);
  for(let level=1;level<=5;level++){
    const same=series.items.filter(x=>x.level===level);
    if(!same.some(x=>x.kind==='test')) failures.push(`Series ${series.number} level ${level} lacks mastery test`);
    const visual=same.filter(x=>x.fingerprint);
    if(visual.length){
      const test=visual.find(x=>x.kind==='test'); const trainings=visual.filter(x=>x.kind!=='test');
      if(test && trainings.some(x=>x.fingerprint===test.fingerprint)) failures.push(`Series ${series.number} level ${level}: mastery test has identical task-area geometry to training`);
      if(trainings.length>=2 && trainings[0].fingerprint===trainings[1].fingerprint) warnings.push(`Series ${series.number} level ${level}: training A/B task-area geometry appears identical`);
    }
  }
  const sampleDir=path.join(SVG_OUT,`${String(series.number).padStart(2,'0')}-${safe(series.seriesSlug)}`); fs.mkdirSync(sampleDir,{recursive:true});
  for(const item of chooseSamples(series.items)) fs.writeFileSync(path.join(sampleDir,`${safe(item.slug)}.svg`),item.svg);
}

const removedExpected=[
  [37,'basic-lines','level-1-training-b'],[54,'patterns','level-1-training-b'],[60,'body-signals','level-1-training-b'],[63,'social-cues','level-1-training-b'],[66,'what-helps-me','level-1-training-b']
];
for(const [number,slug,activitySlug] of removedExpected){
  const series=seriesMap.get(number); if(series?.items.some(x=>x.seriesSlug===slug&&x.slug===activitySlug)) failures.push(`Curated-out item unexpectedly present: series ${number}/${slug}/${activitySlug}`);
}

const report={generatedAt:new Date().toISOString(),summary:{items:rendered.length,series:seriesMap.size,tests:testTotal,failures:failures.length,warnings:warnings.length},domains:domainStats,series:[...seriesMap.values()].sort((a,b)=>a.number-b.number).map(s=>({number:s.number,domain:s.domain,slug:s.seriesSlug,title:s.title,items:s.items.length,tests:s.items.filter(x=>x.kind==='test').length})),failures,warnings};
fs.writeFileSync(path.join(OUT,'report.json'),JSON.stringify(report,null,2));
const md=[
 '# Kids Lab — 1000-item render QA', '',
 `- Items rendered: **${report.summary.items}**`,
 `- Series: **${report.summary.series}**`,
 `- Mastery tests: **${report.summary.tests}**`,
 `- Failures: **${report.summary.failures}**`,
 `- Warnings: **${report.summary.warnings}**`, '',
 '## Domain counts','',
 '| Domain | Items | Tests |','|---|---:|---:|',
 ...domainStats.map(d=>`| ${d.domain} | ${d.items} | ${d.tests} |`), '',
 '## Failures','', ...(failures.length?failures.map(x=>`- ${x}`):['- None']), '',
 '## Warnings (first 120)','', ...(warnings.length?warnings.slice(0,120).map(x=>`- ${x}`):['- None']), ''
];
fs.writeFileSync(path.join(OUT,'report.md'),md.join('\n'));
console.log(`Kids Lab QA: ${rendered.length} items, ${seriesMap.size} series, ${testTotal} tests, ${failures.length} failures, ${warnings.length} warnings.`);
if(failures.length){console.error(failures.slice(0,80).join('\n'));process.exit(1);}
