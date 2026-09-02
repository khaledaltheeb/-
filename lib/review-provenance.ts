type ReviewRecord = {
  last_reviewed_at?: string | null;
  reviewer_display_name?: string | null;
  reviewer_credentials?: string | null;
};

type ReviewerEntityType = 'Organization' | 'Person' | null;

export const RAWAFID_REVIEW_TEAM = 'فريق روافد';

function nonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function reviewerEntityType(value: string | null): ReviewerEntityType {
  if (!value) return null;
  if (value === RAWAFID_REVIEW_TEAM || /^فريق(?:\s|$)/u.test(value)) return 'Organization';

  // A stored process label such as "مراجعة تحريرية وعلمية — منصة روافد" is
  // review provenance, but it is not itself the name of a Person or Organization.
  if (/^مراجعة(?:\s|$)/u.test(value) && value.includes('منصة روافد')) return null;

  return 'Person';
}

export function contentReviewProvenance(record: ReviewRecord) {
  const recordedReviewDate = nonEmptyString(record.last_reviewed_at);
  const explicitReviewer = nonEmptyString(record.reviewer_display_name);
  const explicitCredentials = nonEmptyString(record.reviewer_credentials);
  const hasRecordedReview = Boolean(recordedReviewDate);
  const hasAttributableReviewer = Boolean(hasRecordedReview && explicitReviewer);
  const reviewerType = hasAttributableReviewer ? reviewerEntityType(explicitReviewer) : null;

  // Preserve a recorded review date, but never infer who performed the review.
  // Keep explicitly stored review labels visible, while emitting reviewedBy only
  // when the stored value genuinely identifies a Person or Organization entity.
  const lastReviewedAt = hasRecordedReview ? recordedReviewDate : null;
  const reviewerName = hasAttributableReviewer ? explicitReviewer : null;
  const reviewerCredentials = reviewerType === 'Person' ? explicitCredentials : null;
  const reviewedBySchema = !hasAttributableReviewer || !reviewerType
    ? undefined
    : reviewerType === 'Organization'
      ? {
          '@type': 'Organization',
          name: explicitReviewer,
        } as const
      : {
          '@type': 'Person',
          name: explicitReviewer,
          ...(explicitCredentials ? { description: explicitCredentials } : {}),
        } as const;

  return {
    lastReviewedAt,
    reviewerName,
    reviewerCredentials,
    reviewerType,
    reviewedBySchema,
  } as const;
}
