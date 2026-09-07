import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const nestedDomains = [
  'attention',
  'memory',
  'executive-functions',
  'visual-perception',
  'visual-motor',
  'fine-motor',
  'bilateral',
  'language-reading',
  'math-logic',
  'emotional-regulation',
  'social-skills',
  'sensory-self-regulation',
];
const routes = nestedDomains.map((domain) => `app/capabilities/kids-lab/${domain}/[series]/[activity]/image/route.ts`);
routes.push('app/capabilities/kids-lab/bilateral-tracks/[activity]/image/route.ts');

const failures = [];
for (const relative of routes) {
  const absolute = path.join(ROOT, relative);
  if (!fs.existsSync(absolute)) {
    failures.push(`${relative}: missing image route`);
    continue;
  }
  const source = fs.readFileSync(absolute, 'utf8');
  if (!source.includes('generateStaticParams')) failures.push(`${relative}: image route would render dynamically because generateStaticParams is missing`);
  if (!/export\s+(?:async\s+)?function\s+GET/.test(source)) failures.push(`${relative}: GET handler is missing`);
  if (!/max-age=31536000/.test(source) || !/immutable/.test(source)) failures.push(`${relative}: immutable one-year browser cache is missing`);
}

if (routes.length !== 13) failures.push(`Expected 13 Kids Lab image route families, got ${routes.length}`);
if (failures.length) {
  console.error(`Kids Lab static image contract failed (${failures.length}):`);
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Kids Lab static image contract passed: ${routes.length}/13 worksheet image route families are build-time static and immutable.`);
