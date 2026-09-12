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
  if (!/["']Cache-Control["']\s*:/.test(source)) failures.push(`${relative}: explicit worksheet Cache-Control policy is missing`);
  if (/Cache-Control[^\n]*no-store/i.test(source)) failures.push(`${relative}: static worksheet route must not disable caching with no-store`);
  if (/max-age\s*=\s*31536000[^\n]*immutable/i.test(source)) failures.push(`${relative}: year-long immutable caching can preserve a broken worksheet after an RTL/layout correction`);
  if (!source.includes("@/lib/capabilities/kids-lab-svg-polish")) failures.push(`${relative}: central Kids Lab SVG text normalizer import is missing`);
  if (!source.includes('normalizeKidsLabSvgText(')) failures.push(`${relative}: worksheet SVG must pass through normalizeKidsLabSvgText before the response is returned`);
}

if (routes.length !== 13) failures.push(`Expected 13 Kids Lab image route families, got ${routes.length}`);
if (failures.length) {
  console.error(`Kids Lab static image contract failed (${failures.length}):`);
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log(`Kids Lab static image contract passed: ${routes.length}/13 worksheet image route families are build-time static, centrally normalized, and use a bounded cache policy.`);
