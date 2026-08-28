import fs from 'node:fs';

const seo = fs.readFileSync('lib/seo.ts', 'utf8');

const required = [
  'function truncateAtWordBoundary(value: string, maxLength: number)',
  'const hardLimit = Math.max(1, maxLength - 1);',
  "const lastSpace = candidate.lastIndexOf(' ');",
  'truncateAtWordBoundary(base, available)',
  'truncateAtWordBoundary(clean, 160)',
];

for (const fragment of required) {
  if (!seo.includes(fragment)) {
    throw new Error(`SEO metadata truncation contract missing: ${fragment}`);
  }
}

const forbidden = [
  'clean.slice(0, 159)',
  'clean.slice(0, available - 1)',
  'clean.slice(0, 60).trim()',
];

for (const fragment of forbidden) {
  if (seo.includes(fragment)) {
    throw new Error(`SEO metadata truncation must not cut arbitrary character positions: ${fragment}`);
  }
}

console.log('SEO metadata truncation contract passed: titles and descriptions use the shared word-boundary helper.');
