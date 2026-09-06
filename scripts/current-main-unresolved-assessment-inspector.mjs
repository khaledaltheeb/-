import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const unresolved = [
  'apache-ii',
  'assign-cardiovascular-risk-score',
  'atlas-cdi-score',
  'brief-psychiatric-rating-scale-anchored',
  'chart-short-form',
  'combat-exposure-scale',
  'crohns-disease-activity-index-v1',
  'deployment-risk-resilience-inventory-2',
  'expanded-disability-status-scale',
  'expanded-drs-postacute-interview-caregiver',
  'expanded-drs-postacute-interview-survivor',
  'framingham-cvd-10-year-risk',
  'hamilton-depression-rating-scale-24',
  'international-physical-activity-questionnaire-long-form',
  'jfk-coma-recovery-scale-revised',
  'kurtzke-functional-systems-score',
  'mayo-portland-adaptability-inventory-4',
  'model-for-end-stage-liver-disease',
  'modified-van-assche-index',
  'observer-global-impression',
  'rey-auditory-verbal-learning-test',
  'simple-endoscopic-score-crohns-disease-v1',
  'visual-function-questionnaire-25',
];

const files = fs.readdirSync(path.join(root, 'lib'))
  .filter((name) => /^assessment-measures(?:-wave\d+)?\.ts$/.test(name))
  .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

function objectContainingSlug(source, slug) {
  const needle = `slug: '${slug}'`;
  const at = source.indexOf(needle);
  if (at < 0) return null;
  let start = source.lastIndexOf('{', at);
  if (start < 0) return null;
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  return null;
}

function field(block, name) {
  const single = block.match(new RegExp(`\\b${name}:\\s*'([^']*)'`));
  if (single) return single[1];
  const bool = block.match(new RegExp(`\\b${name}:\\s*(true|false)`));
  if (bool) return bool[1] === 'true';
  return null;
}

function sourceRows(block) {
  return [...block.matchAll(/\{\s*label:\s*'([^']+)'\s*,\s*url:\s*'([^']+)'\s*,\s*role:\s*'([^']+)'\s*\}/g)]
    .map((m) => ({ label: m[1], url: m[2], role: m[3] }));
}

const rows = [];
for (const slug of unresolved) {
  let found = null;
  for (const file of files) {
    const source = fs.readFileSync(path.join(root, 'lib', file), 'utf8');
    const block = objectContainingSlug(source, slug);
    if (block) {
      found = { file, block };
      break;
    }
  }
  if (!found) {
    rows.push({ slug, error: 'catalog entry not found' });
    continue;
  }
  const rightsStatus = field(found.block, 'rightsStatus');
  const rightsLabel = field(found.block, 'rightsLabel');
  const rightsNote = field(found.block, 'rightsNote');
  const rightsVerifiedOn = field(found.block, 'rightsVerifiedOn');
  const fullArabicFormPublished = field(found.block, 'fullArabicFormPublished');
  const arabicStatus = field(found.block, 'arabicStatus');
  const nameEn = field(found.block, 'nameEn');
  const version = field(found.block, 'version');
  const scoring = field(found.block, 'scoring');
  const sources = sourceRows(found.block);
  rows.push({
    slug,
    file: found.file,
    nameEn,
    version,
    rightsStatus,
    rightsLabel,
    rightsNote,
    rightsVerifiedOn,
    arabicStatus,
    fullArabicFormPublished,
    scoring,
    rightsSources: sources.filter((row) => row.role === 'rights'),
    originalSources: sources.filter((row) => row.role === 'original'),
    translationSources: sources.filter((row) => row.role === 'translation'),
  });
}

console.log('UNRESOLVED_ASSESSMENT_CLASSIFICATION');
console.log(JSON.stringify(rows, null, 2));
