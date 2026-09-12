#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';

const ROOT = process.cwd();
const requireNative = createRequire(import.meta.url);
const errors = [];

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function loadTypeScriptModule(relativePath) {
  const file = path.join(ROOT, relativePath);
  const js = ts.transpileModule(read(relativePath), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
    fileName: file,
  }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', '__filename', '__dirname', js)(
    requireNative,
    module,
    module.exports,
    file,
    path.dirname(file)
  );
  return module.exports;
}

function requireText(name, text, pattern, message) {
  if (!pattern.test(text)) errors.push(`${name}: ${message}`);
}

function forbidText(name, text, pattern, message) {
  if (pattern.test(text)) errors.push(`${name}: ${message}`);
}

const helperPath = 'lib/capabilities/kids-lab-svg-polish.ts';
const helperSource = read(helperPath);
const helper = loadTypeScriptModule(helperPath);
const normalize = helper.normalizeKidsLabSvgText;

if (typeof normalize !== 'function') {
  errors.push(`${helperPath}: normalizeKidsLabSvgText export is missing.`);
} else {
  const fixture = `<svg xmlns="http://www.w3.org/2000/svg"><text x="710" text-anchor="end" direction="rtl">الاسم: خالد 12</text><text x="397" text-anchor="middle">تعليمات عربية</text><text x="40" text-anchor="end">English label</text><text x="70">123</text></svg>`;
  const output = normalize(fixture);
  requireText('normalizer fixture', output, /<text x="710" text-anchor="start" direction="rtl" unicode-bidi="plaintext">الاسم: خالد 12<\/text>/, 'RTL Arabic end-anchor must be converted to the visual right-edge start anchor and isolated with plaintext bidi.');
  requireText('normalizer fixture', output, /<text x="397" text-anchor="middle" direction="rtl" unicode-bidi="plaintext">تعليمات عربية<\/text>/, 'Centered Arabic text must retain middle anchoring while receiving explicit RTL bidi isolation.');
  requireText('normalizer fixture', output, /<text x="40" text-anchor="end">English label<\/text>/, 'Non-Arabic labels must not be rewritten as RTL.');
  requireText('normalizer fixture', output, /<text x="70">123<\/text>/, 'Standalone numeric labels must not be rewritten as RTL.');
  forbidText('normalizer fixture', output, /<text[^>]*text-anchor="end"[^>]*direction="rtl"[^>]*>[\s\S]*?[\u0600-\u06FF]/i, 'Arabic RTL output still contains the legacy end-anchor failure mode.');
}

requireText(helperPath, helperSource, /unicode-bidi/, 'central SVG normalizer must keep explicit bidi isolation.');
requireText(helperPath, helperSource, /text-anchor=.*end[\s\S]*text-anchor="start"/, 'central SVG normalizer must keep the RTL end-to-start anchor correction.');

const directRoutes = [
  'app/capabilities/kids-lab/attention/[series]/[activity]/image/route.ts',
  'app/capabilities/kids-lab/bilateral-tracks/[activity]/image/route.ts',
];
for (const route of directRoutes) {
  const source = read(route);
  requireText(route, source, /normalizeKidsLabSvgText/, 'route must normalize generated Arabic SVG text before responding.');
  forbidText(route, source, /max-age=31536000|immutable/, 'stable worksheet URLs must not use a one-year immutable cache after render-contract fixes.');
}

const wrappedRenderers = [
  'lib/capabilities/memory-svg-final.ts',
  'lib/capabilities/visual-motor-svg-final.ts',
];
for (const renderer of wrappedRenderers) {
  const source = read(renderer);
  requireText(renderer, source, /ensureExplicitRtlText/, 'final renderer must pass SVG output through the shared Arabic text normalizer.');
}

const cachedRoutes = [
  'app/capabilities/kids-lab/memory/[series]/[activity]/image/route.ts',
  'app/capabilities/kids-lab/visual-motor/[series]/[activity]/image/route.ts',
];
for (const route of cachedRoutes) {
  const source = read(route);
  forbidText(route, source, /max-age=31536000|immutable/, 'corrected worksheet output must not remain pinned behind a one-year immutable cache.');
}

const affectedPages = [
  'app/capabilities/kids-lab/attention/[series]/[activity]/page.tsx',
  'app/capabilities/kids-lab/memory/[series]/[activity]/page.tsx',
  'app/capabilities/kids-lab/visual-motor/[series]/[activity]/page.tsx',
  'app/capabilities/kids-lab/bilateral-tracks/[activity]/page.tsx',
];
for (const page of affectedPages) {
  const source = read(page);
  requireText(page, source, /\/image\/\?v=/, 'worksheet preview URL must carry a render revision so previously immutable browser caches are bypassed.');
}

if (errors.length) {
  console.error('Kids Lab RTL render contract failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Kids Lab RTL render contract passed: Arabic SVG text uses correct RTL anchoring/bidi isolation and affected previews bypass stale immutable caches.');
