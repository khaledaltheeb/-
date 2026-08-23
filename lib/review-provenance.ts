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
  const hasRecordedReview = Boolean(recordedReviewDate);
  const lastReviewedAt = hasRecordedReview ? recordedReviewDate : null;

  // Rawafid review provenance is institutional. Historical reviewer labels in the
  // database are variants of the same editorial/scientific team, not individual people.
  // Keep one stable public entity rather than manufacturing Person entities.
  const reviewerName = hasRecordedReview ? RAWAFID_REVIEW_TEAM : null;
  const reviewerCredentials = null;
  const reviewerType = hasRecordedReview ? 'Organization' : null;
  const reviewedBySchema = hasRecordedReview
    ? {
        '@type': 'Organization',
        name: RAWAFID_REVIEW_TEAM,
      }
    : undefined;

  return {
    lastReviewedAt,
    reviewerName,
    reviewerCredentials,
    reviewerType,
    reviewedBySchema,
  } as const;
}
