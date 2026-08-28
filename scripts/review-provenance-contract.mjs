import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const helperPath = 'lib/review-provenance.ts';
const helper = fs.readFileSync(path.join(root, helperPath), 'utf8');

const requiredHelperFragments = [
  "const RAWAFID_REVIEW_TEAM = 'فريق روافد';",
  'const hasRecordedReview = Boolean(recordedReviewDate);',
  'const hasAttributableReviewer = Boolean(hasRecordedReview && explicitReviewer);',
  'const lastReviewedAt = hasRecordedReview ? recordedReviewDate : null;',
  'const reviewerName = hasAttributableReviewer ? explicitReviewer : null;',
  "const reviewerType = hasAttributableReviewer ? (institutionalReviewer ? 'Organization' : 'Person') : null;",
  'const reviewedBySchema = !hasAttributableReviewer',
  '? undefined',
  "'@type': 'Organization'",
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
];

for (const fragment of forbiddenHelperFragments) {
  if (helper.includes(fragment)) {
    throw new Error(`Review provenance helper must not infer or serialize absent reviewer identity: ${fragment}`);
  }
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

console.log(`Review provenance contract passed: ${surfaces.length} public surfaces preserve recorded review dates, omit unattributed reviewedBy, and never infer reviewer identity.`);
