import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const helperPath = 'lib/review-provenance.ts';
const helper = fs.readFileSync(path.join(root, helperPath), 'utf8');

const requiredHelperFragments = [
  "const RAWAFID_REVIEW_TEAM = 'فريق روافد';",
  'function isInstitutionalReviewerName(value: string | null)',
  "value.includes('منصة روافد')",
  'const hasRecordedReview = Boolean(recordedReviewDate);',
  'const hasAttributableReviewer = Boolean(hasRecordedReview && explicitReviewer);',
  'const institutionalReviewer = isInstitutionalReviewerName(explicitReviewer);',
  'const lastReviewedAt = hasRecordedReview ? recordedReviewDate : null;',
  'const reviewerName = hasAttributableReviewer ? explicitReviewer : null;',
  "const reviewerType = hasAttributableReviewer ? (institutionalReviewer ? 'Organization' : 'Person') : null;",
  'const reviewedBySchema = !hasAttributableReviewer',
  '? undefined',
  "'@type': 'Organization'",
  "'@type': 'Person'",
  'reviewedBySchema',
];

for (const fragment of requiredHelperFragments) {
  if (!helper.includes(fragment)) {
    throw new Error(`Review provenance helper contract missing: ${fragment}`);
  }
}

const forbiddenHelperFragments = [
  'explicitReviewer || RAWAFID_REVIEW_TEAM',
  "reviewerType = hasRecordedReview ? (explicitReviewer ? 'Person' : 'Organization') : null",
  'name: RAWAFID_REVIEW_TEAM',
  'const reviewedBySchema = !hasAttributableReviewer\n    ? null',
  'const institutionalReviewer = explicitReviewer === RAWAFID_REVIEW_TEAM',
];

for (const fragment of forbiddenHelperFragments) {
  if (helper.includes(fragment)) {
    throw new Error(`Review provenance helper must not infer identity or misclassify recorded institutional labels: ${fragment}`);
  }
}

const institutionalExamples = [
  'فريق روافد',
  'فريق المراجعة العلمية والتحريرية في روافد',
  'فريق تحرير منصة روافد',
  'فريق تحرير منصة روافد — مراجعة المصادر',
  'مراجعة تحريرية وعلمية — منصة روافد',
  'مراجعة تحريرية ومصادر — منصة روافد',
];

const institutionalPattern = (value) => value === 'فريق روافد'
  || /^فريق(?:\s|$)/u.test(value)
  || (/^مراجعة(?:\s|$)/u.test(value) && value.includes('منصة روافد'));

for (const label of institutionalExamples) {
  if (!institutionalPattern(label)) {
    throw new Error(`Institutional reviewer example must classify as Organization: ${label}`);
  }
}

if (institutionalPattern('د. مثال المراجع')) {
  throw new Error('Named individual reviewer example must remain eligible for Person classification.');
}

const surfaces = [
  'components/care-guide-page.tsx',
  'app/evidence-guides/[slug]/page.tsx',
  'components/comparison-article-page.tsx',
  'components/capability-article-page.tsx',
  'components/addiction-article-page.tsx',
  'components/family-guide-article-page.tsx',
  'app/quick-info/[slug]/page.tsx',
  'app/encyclopedia/[slug]/page.tsx',
  'app/content/[slug]/page.tsx',
];

for (const file of surfaces) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  if (!source.includes("from '@/lib/review-provenance'")) {
    throw new Error(`${file}: must import the central review provenance helper`);
  }
  if (!source.includes('contentReviewProvenance(record)')) {
    throw new Error(`${file}: must resolve review provenance from the content record`);
  }
  if (!source.includes('review.lastReviewedAt')) {
    throw new Error(`${file}: lastReviewed must be sourced from recorded review provenance`);
  }
  if (!source.includes('review.reviewerName')) {
    throw new Error(`${file}: visible review attribution must use explicit resolved reviewer identity`);
  }
}

console.log(`Review provenance contract passed: ${surfaces.length} public surfaces preserve recorded review dates, omit unattributed reviewedBy, classify recorded Rawafid team/editorial labels as organizations, and never infer reviewer identity.`);
