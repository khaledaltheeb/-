import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const scriptsDir = path.dirname(new URL(import.meta.url).pathname);
const sourcePath = path.join(scriptsDir, 'kids-lab-render-contract-v3.mjs');
const runtimePath = path.join(scriptsDir, '.kids-lab-render-contract-runtime.mjs');
let source = fs.readFileSync(sourcePath, 'utf8');

const replacements = [
  ['lib/capabilities/memory-svg.ts','lib/capabilities/memory-svg-final.ts'],
  ['lib/capabilities/executive-functions-svg.ts','lib/capabilities/executive-functions-svg-final.ts'],
  ['lib/capabilities/visual-perception-svg.ts','lib/capabilities/visual-perception-svg-final.ts'],
  ['lib/capabilities/visual-motor-svg.ts','lib/capabilities/visual-motor-svg-final.ts'],
  ['lib/capabilities/fine-motor-svg.ts','lib/capabilities/fine-motor-svg-final.ts'],
  ['lib/capabilities/language-reading-svg.ts','lib/capabilities/language-reading-svg-final.ts'],
  ['lib/capabilities/math-logic-svg.ts','lib/capabilities/math-logic-svg-final.ts'],
  ['lib/capabilities/emotional-regulation-svg.ts','lib/capabilities/emotional-regulation-svg-final.ts'],
];
for (const [from,to] of replacements) source = source.replaceAll(from,to);

source = source.replace(
  "function taskTags(svg,c){const tags=svg.match(/<text\\b[^>]*>[\\s\\S]*?<\\/text>|<(?:rect|circle|ellipse|line|path|polygon|polyline)\\b[^>]*\\/?\\s*>/gi)??[];return tags.filter(t=>{const y=yOf(t);return y===null||(y>=c.y+c.height*.20&&y<=c.y+c.height*.90)})}",
  "function taskTags(svg,c){const tags=svg.match(/<g\\b[^>]*transform=[\"'][^\"']+[\"'][^>]*>[\\s\\S]*?<\\/g>|<text\\b[^>]*>[\\s\\S]*?<\\/text>|<(?:rect|circle|ellipse|line|path|polygon|polyline)\\b[^>]*\\/?\\s*>/gi)??[];return tags.filter(t=>{const y=yOf(t);return y===null||(y>=c.y+c.height*.20&&y<=c.y+c.height*.90)})}"
);
source = source.replace(
  "function yOf(t){for(const n of['y','cy','y1'])",
  "function yOf(t){const tr=t.match(/transform=[\"']translate\\([^,\\s]+[,\\s]+(-?\\d+(?:\\.\\d+)?)/i);if(tr)return+tr[1];for(const n of['y','cy','y1'])"
);
source = source.replace(
  "function inspect(svg,id){const f=[],w=[];",
  "function xmlBalance(svg){const stack=[];const re=/<\\/?([A-Za-z][\\w:.-]*)\\b[^>]*\\/?>/g;let m;while((m=re.exec(svg))){const raw=m[0],name=m[1];if(raw.startsWith('</')){const top=stack.pop();if(top!==name)return `closing ${name} does not match ${top??'none'}`;}else if(!raw.endsWith('/>'))stack.push(name);}return stack.length?`unclosed ${stack[stack.length-1]}`:null;}function inspect(svg,id){const f=[],w=[];const xb=xmlBalance(svg);if(xb)f.push(`${id}: malformed SVG XML (${xb})`);"
);
source = source.replace(
  "if(rows.length!==1000)",
  "for(const x of rows.filter(x=>x.number===19)){const ys=[...x.svg.matchAll(/<rect x=\"(?:68|423)\" y=\"([0-9.]+)\" width=\"315\" height=\"92\"/g)].map(m=>+m[1]);const hint=x.svg.match(/<rect x=\"68\" y=\"([0-9.]+)\" width=\"670\" height=\"80\"/);if(ys.length&&hint){const cardBottom=Math.max(...ys)+92,hintY=+hint[1];if(cardBottom+8>hintY)failures.push(`Series 19 ${x.activity}: cards overlap reflection box (${cardBottom} vs ${hintY})`);if(hintY+80>1005)failures.push(`Series 19 ${x.activity}: reflection box intrudes into footer`);}}if(rows.length!==1000)"
);

fs.writeFileSync(runtimePath, source);
await import(`${pathToFileURL(runtimePath).href}?run=${Date.now()}`);
try { fs.unlinkSync(runtimePath); } catch {}
