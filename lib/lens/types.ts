export type LensScholarlySearchOptions = {
  query: string;
  size?: number;
  from?: number;
  yearFrom?: number;
  yearTo?: number;
};

export type LensScholarlyRecord = {
  lens_id?: string;
  title?: string;
  year_published?: number;
  date_published?: string;
  source?: { title?: string };
  authors?: Array<{ first_name?: string; last_name?: string; collective_name?: string }>;
  external_ids?: Array<{ type?: string; value?: string }>;
  open_access?: { is_oa?: boolean; colour?: string };
  scholarly_citations_count?: number;
  references_count?: number;
  abstract?: string;
  [key: string]: unknown;
};

export type LensScholarlySearchResponse = {
  total?: number;
  max_score?: number | null;
  data?: LensScholarlyRecord[];
  results?: LensScholarlyRecord[];
  [key: string]: unknown;
};
