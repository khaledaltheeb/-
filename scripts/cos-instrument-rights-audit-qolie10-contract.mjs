import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => {
  console.error(`COS_INSTRUMENT_RIGHTS_AUDIT_QOLIE10_FAIL: ${message}`);
  process.exitCode = 1;
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const crosswalkPath = 'lib/core-outcome-sets/instrument-crosswalk.ts';
const rightsReviewPath = 'lib/assessment-measures-rights-review.ts';

for (const file of [crosswalkPath, rightsReviewPath]) {
  assert(exists(file), `required file missing: ${file}`);
}

const crosswalk = read(crosswalkPath);
const rightsReview = read(rightsReviewPath);

const extractObjectBlock = (source, marker) => {
  const start = source.indexOf(marker);
  if (start < 0) return '';
  const end = source.indexOf('\n  },', start);
  return source.slice(start, end < 0 ? source.length : end);
};

const qolie = extractObjectBlock(crosswalk, "id: 'qolie-10'");
assert(qolie, 'QOLIE-10 stable crosswalk record missing');
assert(qolie.includes("rawafidStatus: 'reference-rights'"), 'QOLIE-10 must remain reference-rights');
assert(qolie.includes("rightsStatus: 'owner-conditions'"), 'QOLIE-10 must retain owner conditions');
assert(qolie.includes("internalPath: '/assessment-measures/rights-review/#quality-of-life-in-epilepsy-10'"), 'QOLIE-10 rights-review anchor missing');
assert(qolie.includes('QOLIE Development Group'), 'QOLIE-10 owner must remain explicit');
assert(qolie.includes('All rights reserved'), 'QOLIE-10 all-rights-reserved boundary missing');
assert(qolie.includes('لا يجوز تعديل') || qolie.includes('لا تعديل'), 'QOLIE-10 no-modification-without-permission boundary missing');
assert(qolie.includes('الأكاديمية') && qolie.includes('غير الأكاديمية'), 'QOLIE-10 academic/non-academic conditions must remain explicit');
assert(qolie.includes('aan.com/siteassets') && qolie.includes('qolie-10-permission-ltr.pdf'), 'QOLIE-10 AAN-hosted permission letter missing');
assert(qolie.includes("arabicEvidence: 'related-version-only'"), 'QOLIE-10 Arabic evidence must remain related-version-only');
assert(qolie.includes('QOLIE-31') && qolie.includes('المغربي'), 'QOLIE-10 must preserve the Arabic QOLIE-31 exact-version caveat');
assert(qolie.includes('10.1111/epi.17971'), 'QOLIE-10 must retain ICHOM 2024 exact-version language evidence');
assert(qolie.includes('emro.who.int'), 'QOLIE-10 must retain WHO EMRO QOLIE-31 Arabic evidence source');
assert(!qolie.includes("rawafidStatus: 'operational-full'"), 'QOLIE-10 must not become a public operational instrument');
assert(!qolie.includes("rightsStatus: 'not-reviewed'"), 'QOLIE-10 must not regress to unreviewed rights');
assert(!qolie.includes("arabicEvidence: 'not-audited'"), 'QOLIE-10 must not hide the known related-version Arabic evidence');

assert(rightsReview.includes("| 'owner-conditions'"), 'central rights review must support owner-conditions');
const review = extractObjectBlock(rightsReview, "slug: 'quality-of-life-in-epilepsy-10'");
assert(review, 'QOLIE-10 central rights-review entry missing');
assert(review.includes("status: 'owner-conditions'"), 'QOLIE-10 central rights-review status must be owner-conditions');
assert(review.includes("acronym: 'QOLIE-10'"), 'QOLIE-10 central acronym missing');
assert(review.includes('QOLIE Development Group'), 'QOLIE-10 central owner boundary missing');
assert(review.includes('qolie-10-permission-ltr.pdf'), 'QOLIE-10 central rights source must be the AAN-hosted permission letter');
assert(review.includes('لا ننشر البنود') && review.includes('scorer'), 'QOLIE-10 safe Rawafid handling must prohibit public items/scorer');
assert(review.includes('2026-09-06'), 'QOLIE-10 rights verification date missing');

if (!process.exitCode) {
  console.log('COS_INSTRUMENT_RIGHTS_AUDIT_QOLIE10_OK status=reference-rights owner=QOLIE-Development-Group arabic=related-version-only');
}
