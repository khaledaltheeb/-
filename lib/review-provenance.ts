type ReviewRecord = {
  last_reviewed_at?: string | null;
  reviewer_display_name?: string | null;
  reviewer_credentials?: string | null;
};

export const RAWAFID_REVIEW_TEAM = 'فريق روافد';

function nonEmptyString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function isInstitutionalReviewerName(value: string | null) {
  if (!value) return false;
  if (value === RAWAFID_REVIEW_TEAM) return true;

  // These patterns describe explicitly recorded Rawafid team/editorial labels, not people.
  // Do not infer an organization from missing data; this only classifies a stored label.
  return /^فريق(?:\s|$)/u.test(value)
    || (/^مراجعة(?:\s|$)/u.test(value) && value.includes('منصة روافد'));
}

export function contentReviewProvenance(record: ReviewRecord) {
  const recordedReviewDate = nonEmptyString(record.last_reviewed_at);
  const explicitReviewer = nonEmptyString(record.reviewer_display_name);
  const explicitCredentials = nonEmptyString(record.reviewer_credentials);
  const hasRecordedReview = Boolean(recordedReviewDate);
  const hasAttributableReviewer = Boolean(hasRecordedReview && explicitReviewer);
  const institutionalReviewer = isInstitutionalReviewerName(explicitReviewer);

  // Preserve a recorded review date, but never infer who performed the review.
  // Reviewer identity is emitted only when the content record explicitly stores one.
  const lastReviewedAt = hasRecordedReview ? recordedReviewDate : null;
  const reviewerName = hasAttributableReviewer ? explicitReviewer : null;
  const reviewerCredentials = hasAttributableReviewer && !institutionalReviewer ? explicitCredentials : null;
  const reviewerType = hasAttributableReviewer ? (institutionalReviewer ? 'Organization' : 'Person') : null;
  const reviewedBySchema = !hasAttributableReviewer
    ? undefined
    : institutionalReviewer
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
