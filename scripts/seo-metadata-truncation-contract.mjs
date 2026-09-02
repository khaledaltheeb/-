import fs from 'node:fs';

const seo = fs.readFileSync('lib/seo.ts', 'utf8');
const seoGate = fs.readFileSync('scripts/seo-gate.mjs', 'utf8');

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

const requiredGateFragments = [
  "else if (title.length < 8) failures.push(`${pageUrl}: title length ${title.length} is too short to be descriptive`);",
  "else if (description.length < 50) failures.push(`${pageUrl}: description length ${description.length} is too short to summarize the page`);",
];
for (const fragment of requiredGateFragments) {
  if (!seoGate.includes(fragment)) {
    throw new Error(`SEO gate metadata contract missing: ${fragment}`);
  }
}

const forbiddenGateFragments = [
  'title.length > 65',
  'description.length > 170',
  'outside 8..65',
  'outside 50..170',
];
for (const fragment of forbiddenGateFragments) {
  if (seoGate.includes(fragment)) {
    throw new Error(`SEO gate must not enforce an obsolete hard metadata maximum: ${fragment}`);
  }
}

console.log('SEO metadata preservation contract passed: metadata is normalized without arbitrary truncation and the full sitemap gate does not reintroduce hard maxima.');
