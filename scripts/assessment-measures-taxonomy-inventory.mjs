import fs from 'node:fs';

const sourceFiles = [
  'lib/assessment-measures.ts',
  ...Array.from({ length: 11 }, (_, i) => `lib/assessment-measures-wave${i + 2}.ts`),
];

const taxonomyPath = 'lib/assessment-measure-taxonomy.ts';
const taxonomy = fs.readFileSync(taxonomyPath, 'utf8');
const overrideBlock = taxonomy.match(/const explicitKindOverrides:[\s\S]*?=\s*\{([\s\S]*?)\n\};/)?.[1] ?? '';
const explicitSlugs = new Set([...overrideBlock.matchAll(/['"]([^'"]+)['"]\s*:/g)].map((match) => match[1]));

function extractMeasureArray(text, exportNamePattern) {
  const startPattern = new RegExp(`export\\s+const\\s+${exportNamePattern}[^=]*=\\s*\\[`);
  const match = startPattern.exec(text);
  if (!match) return '';
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = match.index + match[0].length - 1; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { quote = ch; continue; }
    if (ch === '[') depth += 1;
    if (ch === ']') {
      depth -= 1;
      if (depth === 0) return text.slice(match.index, i + 1);
    }
  }
  return '';
}

const byFile = {};
const allSlugs = new Set();
for (const file of sourceFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const exportPattern = file.endsWith('assessment-measures.ts') ? 'assessmentMeasures' : 'assessmentMeasuresWave\\d+';
  const arrayText = extractMeasureArray(text, exportPattern);
  if (!arrayText) {
    console.error(`ASSESSMENT_MEASURES_TAXONOMY_INVENTORY: could not isolate measure array in ${file}`);
    process.exit(1);
  }
  const slugs = [...new Set([...arrayText.matchAll(/\bslug\s*:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]))];
  byFile[file] = slugs;
  for (const slug of slugs) allSlugs.add(slug);
}

const slugs = [...allSlugs].sort();
const explicit = slugs.filter((slug) => explicitSlugs.has(slug));
const missing = slugs.filter((slug) => !explicitSlugs.has(slug));
const orphanOverrides = [...explicitSlugs].filter((slug) => !allSlugs.has(slug)).sort();

console.log('ASSESSMENT_MEASURES_TAXONOMY_INVENTORY');
console.log(JSON.stringify({
  sourceFiles: sourceFiles.length,
  measures: slugs.length,
  explicitDecisions: explicit.length,
  missingExplicitDecisions: missing.length,
  missing,
  orphanOverrides,
  perFileCounts: Object.fromEntries(Object.entries(byFile).map(([file, values]) => [file, values.length])),
}, null, 2));

if (process.argv.includes('--require-all-explicit') && missing.length) {
  console.error(`Taxonomy is not fully explicit: ${missing.length} published measures still depend on semantic fallback.`);
  process.exit(1);
}
