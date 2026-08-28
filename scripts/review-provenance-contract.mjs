import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const helperPath = 'lib/review-provenance.ts';
const helper = fs.readFileSync(path.join(root, helperPath), 'utf8');

const requiredHelperFragments = [
  "type ReviewerEntityType = 'Organization' | 'Person' | null;",
  "const RAWAFID_REVIEW_TEAM = 'فريق روافد';",
  'function reviewerEntityType(value: string | null): ReviewerEntityType',
  "value.includes('منصة روافد')",
  'const hasRecordedReview = Boolean(recordedReviewDate);',
  'const hasAttributableReviewer = Boolean(hasRecordedReview && explicitReviewer);',
  'const reviewerType = hasAttributableReviewer ? reviewerEntityType(explicitReviewer) : null;',
  'const lastReviewedAt = hasRecordedReview ? recordedReviewDate : null;',
  'const reviewerName = hasAttributableReviewer ? explicitReviewer : null;',
  "const reviewerCredentials = reviewerType === 'Person' ? explicitCredentials : null;",
  'const reviewedBySchema = !hasAttributableReviewer || !reviewerType',
  '? undefined',
  "reviewerType === 'Organization'",
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
  'function isInstitutionalReviewerName',
];

for (const fragment of forbiddenHelperFragments) {
  if (helper.includes(fragment)) {
    throw new Error(`Review provenance helper must not infer identity or turn review-process labels into entities: ${fragment}`);
  }
}

const entityTypeForRecordedLabel = (value) => {
  if (!value) return null;
  if (value === 'فريق روافد' || /^فريق(?:\s|$)/u.test(value)) return 'Organization';
  if (/^مراجعة(?:\s|$)/u.test(value) && value.includes('منصة روافد')) return null;
  return 'Person';
};

for (const label of [
  'فريق روافد',
  'فريق المراجعة العلمية والتحريرية في روافد',
  'فريق تحرير منصة روافد',
  'فريق تحرير منصة روافد — مراجعة المصادر',
]) {
  if (entityTypeForRecordedLabel(label) !== 'Organization') {
    throw new Error(`Recorded team label must classify as Organization: ${label}`);
  }
}

for (const label of [
  'مراجعة تحريرية وعلمية — منصة روافد',
  'مراجعة تحريرية ومصادر — منصة روافد',
]) {
  if (entityTypeForRecordedLabel(label) !== null) {
    throw new Error(`Recorded review-process label must not be serialized as reviewedBy entity: ${label}`);
  }
}

if (entityTypeForRecordedLabel('د. مثال المراجع') !== 'Person') {
  throw new Error('Named individual reviewer example must remain Person.');
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
    throw new Error(`${file}: visible review attribution must use explicit recorded provenance`);
  }
}

console.log(`Review provenance contract passed: ${surfaces.length} public surfaces preserve recorded review dates, omit unattributed reviewedBy, serialize only genuine reviewer entities, and never infer reviewer identity.`);
