type ReviewRecord = {
  last_reviewed_at?: string | null;
  reviewer_display_name?: string | null;
  reviewer_credentials?: string | null;
};

function nonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function contentReviewProvenance(record: ReviewRecord) {
  const recordedReviewDate = nonEmptyString(record.last_reviewed_at);
  const explicitReviewer = nonEmptyString(record.reviewer_display_name);
  const recordedCredentials = nonEmptyString(record.reviewer_credentials);
  const hasAttributableReview = Boolean(recordedReviewDate && explicitReviewer);
  const lastReviewedAt = hasAttributableReview ? recordedReviewDate : null;
  const reviewerName = hasAttributableReview ? explicitReviewer : null;
  const reviewerCredentials = reviewerName ? recordedCredentials : null;

  return {
    lastReviewedAt,
    reviewerName,
    reviewerCredentials,
    reviewerType: reviewerName && reviewerCredentials ? 'Person' : null,
    reviewedBySchema: reviewerName && reviewerCredentials
      ? {
          '@type': 'Person',
          name: reviewerName,
          description: reviewerCredentials,
        }
      : undefined,
  } as const;
}
