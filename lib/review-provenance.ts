export const RAWAFID_REVIEW_TEAM = 'فريق روافد';

type ReviewRecord = {
  last_reviewed_at?: string | null;
  reviewer_display_name?: string | null;
  reviewer_credentials?: string | null;
};

export function contentReviewProvenance(record: ReviewRecord) {
  const lastReviewedAt = typeof record.last_reviewed_at === 'string' && record.last_reviewed_at.trim()
    ? record.last_reviewed_at.trim()
    : null;
  const explicitReviewer = typeof record.reviewer_display_name === 'string' && record.reviewer_display_name.trim()
    ? record.reviewer_display_name.trim()
    : null;
  const reviewerCredentials = explicitReviewer && typeof record.reviewer_credentials === 'string' && record.reviewer_credentials.trim()
    ? record.reviewer_credentials.trim()
    : null;
  const reviewerName = explicitReviewer || (lastReviewedAt ? RAWAFID_REVIEW_TEAM : null);
  const reviewerType = explicitReviewer ? 'Person' : lastReviewedAt ? 'Organization' : null;

  return {
    lastReviewedAt,
    reviewerName,
    reviewerCredentials,
    reviewerType,
    reviewedBySchema: reviewerName && reviewerType
      ? {
          '@type': reviewerType,
          name: reviewerName,
          ...(reviewerCredentials ? { description: reviewerCredentials } : {}),
        }
      : undefined,
  } as const;
}
