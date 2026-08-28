import fs from 'node:fs';

const seo = fs.readFileSync('lib/seo.ts', 'utf8');

const required = [
  'function normalizeTitle(value: string)',
  'function normalizeDescription(value?: string | null)',
  'return `${clean}${suffix}`;',
  'const title = isHomepage ? HOME_TITLE : normalizeTitle(input.title);',
  'const description = isHomepage ? HOME_DESCRIPTION : normalizeDescription(input.description);',
];

for (const fragment of required) {
  if (!seo.includes(fragment)) {
    throw new Error(`SEO metadata preservation contract missing: ${fragment}`);
  }
}

const forbidden = [
  'truncateAtWordBoundary',
  'clean.slice(0, 159)',
  'clean.slice(0, available - 1)',
  'clean.slice(0, 60).trim()',
  'maxLength - 1',
];

for (const fragment of forbidden) {
  if (seo.includes(fragment)) {
    throw new Error(`SEO metadata must not use a hard character clamp: ${fragment}`);
  }
}

console.log('SEO metadata preservation contract passed: title and description values are normalized without arbitrary character truncation.');
