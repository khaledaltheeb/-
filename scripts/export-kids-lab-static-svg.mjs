import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'public', 'kids-lab-assets');
const nativeRequire = createRequire(import.meta.url);
const cache = new Map();

const domains = [
  ['attention','lib/capabilities/attention-lab.ts','lib/capabilities/attention-svg.ts','renderAttentionWorksheet'],
  ['memory','lib/capabilities/memory-lab.ts','lib/capabilities/memory-svg-final.ts','renderMemoryWorksheet'],
  ['executive-functions','lib/capabilities/executive-functions-lab.ts','lib/capabilities/executive-functions-svg-final.ts','renderExecutiveWorksheet'],
  ['visual-perception','lib/capabilities/visual-perception-lab.ts','lib/capabilities/visual-perception-svg-final.ts','renderVisualPerceptionWorksheet'],
  ['visual-motor','lib/capabilities/visual-motor-lab.ts','lib/capabilities/visual-motor-svg-final.ts','renderVisualMotorWorksheet'],
  ['fine-motor','lib/capabilities/fine-motor-lab.ts','lib/capabilities/fine-motor-svg-final.ts','renderFineMotorWorksheet'],
  ['bilateral-tracks','lib/capabilities/bilateral-tracks.ts','lib/capabilities/bilateral-svg.ts','renderBilateralSvg',43],
  ['bilateral','lib/capabilities/bilateral-lab.ts','lib/capabilities/bilateral-lab-svg.ts','renderBilateralLabWorksheet'],
  ['language-reading','lib/capabilities/language-reading-lab.ts','lib/capabilities/language-reading-svg-final.ts','renderLanguageReadingWorksheet'],
  ['math-logic','lib/capabilities/math-logic-lab.ts','lib/capabilities/math-logic-svg-final.ts','renderMathLogicSvg'],
  ['emotional-regulation','lib/capabilities/emotional-regulation-lab.ts','lib/capabilities/emotional-regulation-svg-final.ts','renderEmotionalRegulationSvg'],
  ['social-skills','lib/capabilities/social-skills-lab.ts','lib/capabilities/social-skills-svg.ts','renderSocialSvg'],
  ['sensory-self-regulation','lib/capabilities/sensory-self-regulation-lab.ts','lib/capabilities/sensory-self-regulation-svg.ts','renderSensorySelfSvg'],
];

function local(from, specifier) {
  let base;
  if (specifier.startsWith('@/')) base = path.join(ROOT, specifier.slice(2));
  else if (specifier.startsWith('.')) base = path.resolve(path.dirname(from), specifier);
  else return null;
  return [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, path.join(base, 'index.ts')].find(fs.existsSync) ?? null;
}

function load(file) {
  const absolute = path.resolve(ROOT, file);
  if (cache.has(absolute)) return cache.get(absolute).exports;
  const js = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
    fileName: absolute,
  }).outputText;
  const module = { exports: {} };
  cache.set(absolute, module);
  new Function('require','module','exports','__filename','__dirname', js)(
    (specifier) => { const found = local(absolute, specifier); return found ? load(found) : nativeRequire(specifier); },
    module, module.exports, absolute, path.dirname(absolute),
  );
  return module.exports;
}

function activityArray(module, label) {
  const candidates = Object.values(module)
    .filter((value) => Array.isArray(value) && value.length && value.slice(0, 5).every((item) => item && typeof item === 'object' && typeof item.slug === 'string' && Number.isInteger(item.level) && typeof item.kind === 'string'))
    .sort((a, b) => b.length - a.length);
  if (!candidates.length) throw new Error(`No activity array found for ${label}`);
  return candidates[0];
}

fs.rmSync(OUT, { recursive: true, force: true });
let total = 0;
let tests = 0;
for (const [domain, dataPath, rendererPath, rendererName, fixedSeries] of domains) {
  const data = load(dataPath);
  const renderer = load(rendererPath)[rendererName];
  const activities = activityArray(data, domain);
  for (const item of activities) {
    const series = fixedSeries === 43 ? null : item.seriesSlug;
    const destination = fixedSeries === 43
      ? path.join(OUT, domain, `${item.slug}.svg`)
      : path.join(OUT, domain, series, `${item.slug}.svg`);
    const svg = renderer(item);
    if (typeof svg !== 'string' || !svg.includes('<svg') || !svg.includes('</svg>') || /\b(?:NaN|Infinity|undefined)\b/.test(svg)) {
      throw new Error(`Invalid SVG for ${domain}/${series ?? ''}/${item.slug}`);
    }
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, svg);
    total += 1;
    if (item.kind === 'test') tests += 1;
  }
}
if (total !== 1000) throw new Error(`Expected 1000 static Kids Lab SVG assets; exported ${total}`);
if (tests !== 335) throw new Error(`Expected 335 static Kids Lab test SVG assets; exported ${tests}`);
console.log(`Kids Lab static SVG export complete: ${total} worksheets, ${tests} tests, ${domains.length} domains.`);
