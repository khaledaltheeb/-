type ReviewRecord = {
  last_reviewed_at?: string | null;
  reviewer_display_name?: string | null;
  reviewer_credentials?: string | null;
};

export const RAWAFID_REVIEW_TEAM = 'فريق روافد';

function nonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function contentReviewProvenance(record: ReviewRecord) {
  const recordedReviewDate = nonEmptyString(record.last_reviewed_at);
  const explicitReviewer = nonEmptyString(record.reviewer_display_name);
  const explicitCredentials = nonEmptyString(record.reviewer_credentials);
  const hasRecordedReview = Boolean(recordedReviewDate);

  // Never manufacture review provenance. A reviewer is attributed only when the content
  // record contains a real review timestamp. If a named reviewer was recorded, preserve
  // that person and their recorded credentials; otherwise use Rawafid's institutional
  // review team as the organization fallback for that recorded review.
  const lastReviewedAt = hasRecordedReview ? recordedReviewDate : null;
  const reviewerName = hasRecordedReview ? explicitReviewer || RAWAFID_REVIEW_TEAM : null;
  const reviewerCredentials = hasRecordedReview && explicitReviewer ? explicitCredentials : null;
  const reviewerType = hasRecordedReview ? (explicitReviewer ? 'Person' : 'Organization') : null;
  const reviewedBySchema = !hasRecordedReview
    ? null
    : explicitReviewer
      ? {
          '@type': 'Person',
          name: explicitReviewer,
          ...(explicitCredentials ? { description: explicitCredentials } : {}),
        } as const
      : {
          '@type': 'Organization',
          name: RAWAFID_REVIEW_TEAM,
        } as const;

  return {
    lastReviewedAt,
    reviewerName,
    reviewerCredentials,
    reviewerType,
    reviewedBySchema,
  } as const;
}
