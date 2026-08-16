-- Supersedes the earlier temporary assumption that a review date could not be
-- attributed to the Rawafid review team. Project policy is explicit:
-- last_reviewed_at records a completed review by فريق روافد unless an individual
-- reviewer is recorded in reviewer_display_name / reviewer_credentials.

comment on column public.content.last_reviewed_at is
'Timestamp of a completed content review. When non-null, the content has been reviewed by فريق روافد. reviewer_display_name and reviewer_credentials identify an individual reviewer when explicitly recorded; otherwise the reviewer is the Rawafid review team organization.';
