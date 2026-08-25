import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const helperPath = 'lib/review-provenance.ts';
const helper = fs.readFileSync(path.join(root, helperPath), 'utf8');

const requiredHelperFragments = [
  "const RAWAFID_REVIEW_TEAM = 'فريق روافد';",
  'const hasRecordedReview = Boolean(recordedReviewDate);',
  'const lastReviewedAt = hasRecordedReview ? recordedReviewDate : null;',
  'const reviewerName = hasRecordedReview ? explicitReviewer || RAWAFID_REVIEW_TEAM : null;',
  "const reviewerType = hasRecordedReview ? (explicitReviewer ? 'Person' : 'Organization') : null;",
  "'@type': 'Organization'",
  'name: RAWAFID_REVIEW_TEAM',
  'reviewedBySchema',
];

for (const fragment of requiredHelperFragments) {
  if (!helper.includes(fragment)) {
    throw new Error(`Review provenance helper contract missing: ${fragment}`);
  }
}

const forbiddenHelperFragments = [
  'const hasAttributableReview = Boolean(recordedReviewDate && explicitReviewer);',
  'const reviewerName = hasAttributableReview ? explicitReviewer : null;',
  'reject inferred team review attribution',
];

for (const fragment of forbiddenHelperFragments) {
  if (helper.includes(fragment)) {
    throw new Error(`Review provenance helper contradicts the Rawafid review-team policy: ${fragment}`);
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

  if (file === 'components/care-guide-page.tsx') {
    const metadataOnlyFragments = [
      "review_visibility === 'metadata_only'",
      'visibleReview.reviewerName',
      'visibleReview.lastReviewedAt',
      'review.reviewedBySchema',
    ];
    for (const fragment of metadataOnlyFragments) {
      if (!source.includes(fragment)) {
        throw new Error(`${file}: metadata-only review provenance contract missing: ${fragment}`);
      }
    }
  } else if (!source.includes('review.reviewerName')) {
    throw new Error(`${file}: visible review attribution must use the resolved reviewer`);
  }
}

console.log(`Review provenance contract passed: ${surfaces.length} public surfaces preserve lastReviewed as recorded provenance; Care Guides may explicitly mark review provenance metadata-only to preserve visual parity while structured data remains truthful.`);
