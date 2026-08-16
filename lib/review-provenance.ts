type ReviewRecord = {
  last_reviewed_at?: string | null;
  reviewer_display_name?: string | null;
  reviewer_credentials?: string | null;
};

const RAWAFID_REVIEW_TEAM = 'فريق روافد';

function nonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function contentReviewProvenance(record: ReviewRecord) {
  const recordedReviewDate = nonEmptyString(record.last_reviewed_at);
  const explicitReviewer = nonEmptyString(record.reviewer_display_name);
  const recordedCredentials = nonEmptyString(record.reviewer_credentials);
  const hasRecordedReview = Boolean(recordedReviewDate);
  const lastReviewedAt = hasRecordedReview ? recordedReviewDate : null;
  const reviewerName = hasRecordedReview ? explicitReviewer || RAWAFID_REVIEW_TEAM : null;
  const reviewerCredentials = explicitReviewer ? recordedCredentials : null;
  const reviewerType = hasRecordedReview ? (explicitReviewer ? 'Person' : 'Organization') : null;

  const reviewedBySchema = !hasRecordedReview
    ? undefined
    : explicitReviewer
      ? {
          '@type': 'Person',
          name: explicitReviewer,
          description: recordedCredentials || undefined,
        }
      : {
          '@type': 'Organization',
          name: RAWAFID_REVIEW_TEAM,
        };

  return {
    lastReviewedAt,
    reviewerName,
    reviewerCredentials,
    reviewerType,
    reviewedBySchema,
  } as const;
}
