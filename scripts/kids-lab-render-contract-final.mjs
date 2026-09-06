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

// A large share of the visual-perception stimuli use <g transform="translate(...) rotate(...) scale(...)">.
// Include those group transforms in both content and geometry fingerprints; otherwise two visibly
// different worksheets can look identical to a tag-only parser that inspects just child paths.
source = source.replaceAll(
  '(?:rect|circle|ellipse|line|path|polygon|polyline)',
  '(?:g|rect|circle|ellipse|line|path|polygon|polyline)'
);
source = source.replace(
  "function yOf(t){for(const n of['y','cy','y1'])",
  "function yOf(t){const tr=t.match(/transform=[\"']translate\\([^,\\s]+[,\\s]+(-?\\d+(?:\\.\\d+)?)/i);if(tr)return+tr[1];for(const n of['y','cy','y1'])"
);

fs.writeFileSync(runtimePath, source);
await import(`${pathToFileURL(runtimePath).href}?run=${Date.now()}`);
try { fs.unlinkSync(runtimePath); } catch {}
