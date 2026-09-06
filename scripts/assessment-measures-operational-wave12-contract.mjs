import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`ASSESSMENT_OPERATIONAL_WAVE12_FAIL: ${message}`);
  process.exitCode = 1;
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const formPath = 'lib/assessment-measure-operational-full-forms-wave11.ts';
const catalogPath = 'lib/assessment-measure-operational-catalog.ts';
const measurePath = 'lib/assessment-measures-wave2.ts';

for (const file of [formPath, catalogPath, measurePath]) {
  assert(exists(file), `required file missing: ${file}`);
}

const form = read(formPath);
const catalog = read(catalogPath);
const measureSource = read(measurePath);

const extractObjectBlock = (source, marker) => {
  const start = source.indexOf(marker);
  if (start < 0) return '';
  const end = source.indexOf('\n  },', start);
  return source.slice(start, end < 0 ? source.length : end);
};

const swlsMeasure = extractObjectBlock(measureSource, "slug: 'satisfaction-with-life-scale'");
assert(swlsMeasure, 'SWLS measure record missing');
assert(swlsMeasure.includes("rightsStatus: 'public-domain'"), 'SWLS must retain Public Domain status');
assert(swlsMeasure.includes('Public Domain'), 'SWLS public-domain rights label missing');

assert(form.includes("'satisfaction-with-life-scale': {"), 'SWLS operational record missing');
assert(form.includes("kind: 'scoring-form'"), 'SWLS must remain a recording/scoring sheet');
assert(form.includes("completeness: 'recording-and-scoring-sheet'"), 'SWLS completeness boundary missing');
assert(form.includes('Original 5-item SWLS, Diener et al. 1985'), 'SWLS exact original version missing');
assert(form.includes('المجال العام') && form.includes('غير محمي بحقوق النشر'), 'SWLS owner public-domain statement missing');
assert(form.includes('Ed Diener') && form.includes('Robert A. Emmons') && form.includes('Randy J. Larsen') && form.includes('Sharon Griffin'), 'SWLS author attribution boundary missing');
assert(form.includes('SWLS.html'), 'SWLS official owner page link missing');
assert(form.includes('SWLS_Arabic2.pdf'), 'SWLS official-hosted Arabic translation link missing');
assert(form.includes('خلل ترميز') || form.includes('استخراج آلي مشوّه'), 'SWLS Arabic extraction-quality safeguard missing');
assert(form.includes('لا تعيد روافد كتابة نص الترجمة') || form.includes('عدم إعادة كتابة نص الترجمة'), 'SWLS must not reproduce corrupted extracted Arabic text');

for (const code of ['SWLS-1', 'SWLS-2', 'SWLS-3', 'SWLS-4', 'SWLS-5']) {
  assert(form.includes(`code: '${code}'`), `SWLS required score field missing: ${code}`);
}
for (const score of [1, 2, 3, 4, 5, 6, 7]) {
  assert(form.includes(`score: ${score}`), `SWLS 1-7 response option missing score ${score}`);
}
assert(form.includes('5 إلى 35') || form.includes('5–35'), 'SWLS total score range 5-35 missing');
for (const band of ['31–35', '26–30', '21–25', '15–19', '10–14', '5–9']) {
  assert(form.includes(band), `SWLS descriptive score band missing: ${band}`);
}
assert(form.includes('20 محايد'), 'SWLS neutral score 20 missing');
assert(form.includes('لا يشخّص الاكتئاب') || form.includes('لا تكفي لتشخيص الاكتئاب'), 'SWLS depression diagnostic boundary missing');
assert(form.includes('ليس أداة تقييم خطر') || form.includes('فرز للانتحار'), 'SWLS safety/risk boundary missing');

assert(catalog.includes("assessmentOperationalFullFormsWave11 } from '@/lib/assessment-measure-operational-full-forms-wave11'"), 'operational catalog Wave 11 import missing');
assert(catalog.includes('...assessmentOperationalFullFormsWave11'), 'operational catalog Wave 11 spread missing');

if (!process.exitCode) {
  console.log('ASSESSMENT_OPERATIONAL_WAVE12_OK swls_items=5 score_range=5-35 response=1-7 rights=owner-confirmed-public-domain arabic=official-hosted-link-no-corrupt-republication safety=non-diagnostic');
}
