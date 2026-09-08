import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const ROOT = process.cwd();
const nativeRequire = createRequire(import.meta.url);
const moduleCache = new Map();
const failures = [];
const warnings = [];

function localModule(fromFile, specifier) {
  let base;
  if (specifier.startsWith('@/')) base = path.join(ROOT, specifier.slice(2));
  else if (specifier.startsWith('.')) base = path.resolve(path.dirname(fromFile), specifier);
  else return null;
  return [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.mjs`, path.join(base, 'index.ts')].find(fs.existsSync) ?? null;
}

function loadTs(relativePath) {
  const absolute = path.resolve(ROOT, relativePath);
  if (moduleCache.has(absolute)) return moduleCache.get(absolute).exports;
  const source = fs.readFileSync(absolute, 'utf8');
  const output = ts.transpileModule(source, {
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
    const local = localModule(absolute, specifier);
    return local ? loadTs(path.relative(ROOT, local)) : nativeRequire(specifier);
  };
  // QA-only loader for repository-local TypeScript modules.
  // eslint-disable-next-line no-new-func
  new Function('require', 'module', 'exports', '__filename', '__dirname', output)(localRequire, record, record.exports, absolute, path.dirname(absolute));
  return record.exports;
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\b${name}=["']([^"']+)["']`, 'i'));
  return m?.[1] ?? null;
}

function textValue(tag) {
  return tag.replace(/<[^>]+>/g, '').replace(/&(?:amp|lt|gt|quot|apos|#\d+);/g, 'x').trim();
}

function estimatedTextWidth(value, fontSize) {
  let units = 0;
  for (const char of value) {
    if (/\s/.test(char)) units += 0.32;
    else if (/[\u0600-\u06FF]/.test(char)) units += 0.61;
    else if (/[A-Z0-9]/.test(char)) units += 0.62;
    else units += 0.53;
  }
  return units * fontSize;
}

const cssPath = path.join(ROOT, 'app/capabilities/kids-lab/kids-lab.module.css');
const css = fs.readFileSync(cssPath, 'utf8');
for (const required of ['worksheetFrame', 'previewFrame', 'previewCard', 'infoGrid']) {
  if (!new RegExp(`\\.${required}(?:\\b|\\s|,|\\{)`).test(css)) failures.push(`CSS missing required class .${required}`);
}
if (!/env\(safe-area-inset-bottom/.test(css)) failures.push('Mobile Kids Lab shell lacks safe-area bottom spacing');
if (!/\.worksheetFrame img,\s*\.previewFrame img,\s*\.previewCard img[\s\S]*?max-width:\s*100%/m.test(css)) failures.push('Shared worksheet preview images are not width-contained');

const pageRoot = path.join(ROOT, 'app/capabilities/kids-lab');
const usedClasses = new Map();
for (const file of walk(pageRoot).filter((x) => /\.(?:tsx|ts)$/.test(x))) {
  const source = fs.readFileSync(file, 'utf8');
  for (const match of source.matchAll(/styles\.([A-Za-z_][A-Za-z0-9_]*)/g)) {
    const name = match[1];
    if (!usedClasses.has(name)) usedClasses.set(name, []);
    usedClasses.get(name).push(path.relative(ROOT, file));
  }
}
for (const [name, files] of usedClasses) {
  if (!new RegExp(`\\.${name}(?:\\b|\\s|,|\\{|:)`).test(css)) {
    failures.push(`Undefined Kids Lab CSS-module class styles.${name} used by ${[...new Set(files)].slice(0, 4).join(', ')}`);
  }
}

const data = loadTs('lib/capabilities/emotional-regulation-lab.ts');
const renderer = loadTs('lib/capabilities/emotional-regulation-svg-final.ts');
const activities = data.emotionalRegulationActivities;
if (!Array.isArray(activities) || !activities.length) failures.push('No emotional regulation activities found');
if (typeof renderer.renderEmotionalRegulationSvg !== 'function') failures.push('Final emotional-regulation renderer missing');

const source = fs.readFileSync(path.join(ROOT, 'lib/capabilities/emotional-regulation-svg.ts'), 'utf8');
if (!source.includes("ltr(64,112,'Health Renewal'")) failures.push('Health Renewal brand text is not explicitly LTR');
if (/const\s+bodyPose\s*=|Math\.floor\(r\(\)\*4\)|const\s+rng\s*=/.test(source)) failures.push('Legacy random/duplicate emotional drawing logic is still present');
if (!source.includes("posture(x+95,y+92,e)")) failures.push('Emotion posture is not placed in the collision-safe body zone');
if (!source.includes('y+54')) failures.push('Emotion posture lower bound contract is missing');
if (!source.includes('y+154')) failures.push('Emotion label safe band contract is missing');

let rendered = 0;
for (const activity of activities ?? []) {
  let svg;
  try {
    svg = renderer.renderEmotionalRegulationSvg(activity);
  } catch (error) {
    failures.push(`${activity.seriesSlug}/${activity.slug}: renderer threw ${error instanceof Error ? error.message : String(error)}`);
    continue;
  }
  rendered += 1;
  const id = `${activity.seriesSlug}/${activity.slug}`;
  if (!svg.includes('<svg') || !svg.includes('</svg>')) failures.push(`${id}: invalid SVG shell`);
  if (/\b(?:NaN|Infinity|undefined)\b/.test(svg)) failures.push(`${id}: invalid numeric token`);
  if (svg.includes('☐')) failures.push(`${id}: checkbox glyph is embedded in text instead of a discrete control`);
  if (/_{3,}/.test(svg)) failures.push(`${id}: underscore answer line remains in rendered SVG`);

  const texts = svg.match(/<text\b[^>]*>[\s\S]*?<\/text>/gi) ?? [];
  for (const tag of texts) {
    const value = textValue(tag);
    if (!value) continue;
    const direction = attr(tag, 'direction');
    const anchor = attr(tag, 'text-anchor') ?? 'start';
    const x = Number(attr(tag, 'x'));
    const y = Number(attr(tag, 'y'));
    const fontSize = Number(attr(tag, 'font-size') ?? 16);
    const hasArabic = /[\u0600-\u06FF]/.test(value);
    if (hasArabic && direction !== 'rtl') failures.push(`${id}: Arabic text lacks RTL direction: ${value.slice(0, 48)}`);
    if (value.includes('Health Renewal') && direction !== 'ltr') failures.push(`${id}: Health Renewal is not LTR`);
    if (Number.isFinite(x) && (x < 0 || x > 794)) failures.push(`${id}: text x=${x} outside canvas`);
    if (Number.isFinite(y) && (y < 0 || y > 1123)) failures.push(`${id}: text y=${y} outside canvas`);
    if (Number.isFinite(x) && Number.isFinite(fontSize)) {
      const width = estimatedTextWidth(value, fontSize);
      let available;
      if (anchor === 'middle') available = 2 * Math.min(x, 794 - x);
      else if (direction === 'rtl') available = anchor === 'start' ? x : 794 - x;
      else available = anchor === 'end' ? x : 794 - x;
      if (available > 0 && width > available * 1.04) failures.push(`${id}: probable horizontal text overflow (${Math.round(width)} > ${Math.round(available)}): ${value.slice(0, 55)}`);
    }
  }

  for (const tag of svg.match(/<rect\b[^>]*>/gi) ?? []) {
    const x = Number(attr(tag, 'x') ?? 0);
    const y = Number(attr(tag, 'y') ?? 0);
    const width = Number(attr(tag, 'width'));
    const height = Number(attr(tag, 'height'));
    if ([x, y, width, height].every(Number.isFinite) && (x < 0 || y < 0 || x + width > 794.01 || y + height > 1123.01)) {
      failures.push(`${id}: rectangle leaves canvas (${x},${y},${width},${height})`);
    }
  }
}

if (rendered !== (activities?.length ?? 0)) failures.push(`Rendered ${rendered}/${activities?.length ?? 0} emotional worksheets`);

const report = {
  generatedAt: new Date().toISOString(),
  emotionalWorksheets: rendered,
  cssModuleClassesChecked: usedClasses.size,
  failures: failures.length,
  warnings: warnings.length,
  failureDetails: failures,
  warningDetails: warnings,
};
const outDir = path.join(ROOT, 'artifacts', 'kids-lab-visual-regression');
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(path.join(outDir, 'report.md'), [
  '# Kids Lab visual regression contract',
  '',
  `- Emotional worksheets rendered: **${rendered}**`,
  `- CSS module classes checked: **${usedClasses.size}**`,
  `- Failures: **${failures.length}**`,
  `- Warnings: **${warnings.length}**`,
  '',
  '## Failures',
  ...(failures.length ? failures.map((x) => `- ${x}`) : ['- None']),
].join('\n'));

console.log(`Kids Lab visual regression: ${rendered} emotional worksheets, ${usedClasses.size} CSS classes, ${failures.length} failures.`);
if (failures.length) {
  console.error(failures.slice(0, 150).join('\n'));
  process.exit(1);
}
