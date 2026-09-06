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

// Transformed visual stimuli (butterflies, fish, abstract shapes, etc.) use local child coordinates.
// Fingerprint the whole transformed <g> block as one task unit; otherwise child colors/details may be
// discarded by page-coordinate filtering even though they are visibly inside the worksheet task area.
source = source.replace(
  "function taskTags(svg,c){const tags=svg.match(/<text\\b[^>]*>[\\s\\S]*?<\\/text>|<(?:rect|circle|ellipse|line|path|polygon|polyline)\\b[^>]*\\/?\\s*>/gi)??[];return tags.filter(t=>{const y=yOf(t);return y===null||(y>=c.y+c.height*.20&&y<=c.y+c.height*.90)})}",
  "function taskTags(svg,c){const tags=svg.match(/<g\\b[^>]*transform=[\"'][^\"']+[\"'][^>]*>[\\s\\S]*?<\\/g>|<text\\b[^>]*>[\\s\\S]*?<\\/text>|<(?:rect|circle|ellipse|line|path|polygon|polyline)\\b[^>]*\\/?\\s*>/gi)??[];return tags.filter(t=>{const y=yOf(t);return y===null||(y>=c.y+c.height*.20&&y<=c.y+c.height*.90)})}"
);
source = source.replace(
  "function yOf(t){for(const n of['y','cy','y1'])",
  "function yOf(t){const tr=t.match(/transform=[\"']translate\\([^,\\s]+[,\\s]+(-?\\d+(?:\\.\\d+)?)/i);if(tr)return+tr[1];for(const n of['y','cy','y1'])"
);

fs.writeFileSync(runtimePath, source);
await import(`${pathToFileURL(runtimePath).href}?run=${Date.now()}`);
try { fs.unlinkSync(runtimePath); } catch {}
