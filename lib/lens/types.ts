export type LensIdentifier = {
  type?: string;
  value?: string;
};

export type LensAffiliation = {
  name?: string;
  name_original?: string;
  grid_id?: string;
  country_code?: string;
  ids?: LensIdentifier[];
};

export type LensAuthor = {
  collective_name?: string;
  first_name?: string;
  last_name?: string;
  initials?: string;
  ids?: LensIdentifier[];
  affiliations?: LensAffiliation[];
};

export type LensOpenAccessLocation = {
  landing_page_urls?: string[];
  pdf_urls?: string[];
};

export type LensOpenAccess = {
  license?: string;
  colour?: string;
  locations?: LensOpenAccessLocation | LensOpenAccessLocation[];
};

export type LensSource = {
  title?: string;
  type?: string;
  publisher?: string;
  country?: string;
  issn?: Array<{ type?: string; value?: string }>;
  asjc_codes?: string | string[];
  asjc_subjects?: string | string[];
};

export type LensRetractionUpdate = {
  updated?: string;
  update_nature?: string;
  reasons?: string[];
  notes?: string;
  urls?: string[];
};

export type LensScholarlySearchOptions = {
  query: string;
  size?: number;
  from?: number;
  yearFrom?: number;
  yearTo?: number;
  publicationTypes?: string[];
  openAccessOnly?: boolean;
  includeRetracted?: boolean;
};

export type LensScholarlyRecord = {
  lens_id?: string;
  title?: string;
  publication_type?: string;
  publication_supplementary_type?: string[];
  year_published?: number;
  date_published?: string;
  languages?: string[];
  source?: LensSource;
  authors?: LensAuthor[];
  author_count?: number;
  external_ids?: LensIdentifier[];
  open_access?: LensOpenAccess;
  scholarly_citations_count?: number;
  patent_citations_count?: number;
  references_count?: number;
  references_resolved_count?: number;
  fields_of_study?: string[];
  keywords?: string[];
  mesh_terms?: Array<{ mesh_id?: string; mesh_heading?: string; qualifier_id?: string; qualifier_name?: string }>;
  source_urls?: Array<{ type?: string; url?: string }>;
  retraction_updates?: LensRetractionUpdate[];
  abstract?: string;
  [key: string]: unknown;
};

export type LensScholarlySearchResponse = {
  total?: number;
  max_score?: number | null;
  data?: LensScholarlyRecord[];
  _rawafid?: {
    source: 'The Lens';
    endpoint: 'scholarly/search';
    rate_limit_remaining_per_minute: string | null;
    rate_limit_remaining_per_month: string | null;
    record_limit_remaining_per_month: string | null;
  };
  [key: string]: unknown;
};
