import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const scriptsDir = path.dirname(new URL(import.meta.url).pathname);
const sourcePath = path.join(scriptsDir, 'kids-lab-render-contract-v3.mjs');
const runtimePath = path.join(scriptsDir, '.kids-lab-render-contract-runtime.mjs');
let source = fs.readFileSync(sourcePath, 'utf8');

const replacements = [
  ['lib/capabilities/executive-functions-svg.ts','lib/capabilities/executive-functions-svg-final.ts'],
  ['lib/capabilities/visual-perception-svg.ts','lib/capabilities/visual-perception-svg-final.ts'],
  ['lib/capabilities/visual-motor-svg.ts','lib/capabilities/visual-motor-svg-final.ts'],
  ['lib/capabilities/fine-motor-svg.ts','lib/capabilities/fine-motor-svg-final.ts'],
  ['lib/capabilities/math-logic-svg.ts','lib/capabilities/math-logic-svg-final.ts'],
  ['lib/capabilities/emotional-regulation-svg.ts','lib/capabilities/emotional-regulation-svg-final.ts'],
];
for (const [from,to] of replacements) source = source.replaceAll(from,to);
fs.writeFileSync(runtimePath, source);
await import(`${pathToFileURL(runtimePath).href}?run=${Date.now()}`);
try { fs.unlinkSync(runtimePath); } catch {}
