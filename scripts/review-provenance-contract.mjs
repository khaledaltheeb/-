import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const helperPath = 'lib/review-provenance.ts';
const helper = fs.readFileSync(path.join(root, helperPath), 'utf8');

const requiredHelperFragments = [
  'const hasAttributableReview = Boolean(recordedReviewDate && explicitReviewer);',
  'const lastReviewedAt = hasAttributableReview ? recordedReviewDate : null;',
  'const reviewerName = hasAttributableReview ? explicitReviewer : null;',
  'reviewerName && reviewerCredentials',
  'reviewedBySchema',
];

for (const fragment of requiredHelperFragments) {
  if (!helper.includes(fragment)) {
    throw new Error(`Review provenance helper contract missing: ${fragment}`);
  }
}

const forbiddenHelperFragments = [
  'RAWAFID_REVIEW_TEAM',
  "explicitReviewer || (lastReviewedAt ?",
  "lastReviewedAt ? 'Organization' : null",
];

for (const fragment of forbiddenHelperFragments) {
  if (helper.includes(fragment)) {
    throw new Error(`Review provenance helper must not infer review attribution: ${fragment}`);
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
    throw new Error(`${file}: lastReviewed must be sourced from attributable review provenance`);
  }
  if (!source.includes('review.reviewerName')) {
    throw new Error(`${file}: visible review attribution must use the resolved reviewer`);
  }
}

console.log(`Review provenance contract passed: ${surfaces.length} public surfaces reject inferred team review attribution and expose only attributable review records.`);
