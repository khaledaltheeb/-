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

  // Rawafid uses one institutional review entity for published knowledge content.
  // A missing historical review timestamp must not erase that entity, but we also
  // never manufacture a lastReviewed date: the date is emitted only when stored.
  const lastReviewedAt = recordedReviewDate;
  const reviewerName = RAWAFID_REVIEW_TEAM;
  const reviewerCredentials = null;
  const reviewerType = 'Organization' as const;
  const reviewedBySchema = {
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
