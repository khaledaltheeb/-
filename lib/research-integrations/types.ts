export type EvidenceProvider = 'europe_pmc' | 'lens';

export type EvidenceIdentifiers = {
  doi?: string;
  pmid?: string;
  pmcid?: string;
  openalex?: string;
  lens?: string;
};

export type EvidenceAffiliation = {
  name: string;
  original?: string | null;
  ror_id?: string | null;
  country_code?: string | null;
};

export type EvidenceAuthor = {
  display_name: string;
  orcid?: string | null;
  affiliations?: EvidenceAffiliation[];
};

export type EvidenceRecord = {
  provider: EvidenceProvider;
  provider_id: string;
  title: string | null;
  abstract: string | null;
  publication_type: string | null;
  publication_year: number | null;
  publication_date: string | null;
  journal: string | null;
  publisher: string | null;
  authors: EvidenceAuthor[];
  identifiers: EvidenceIdentifiers;
  cited_by_count: number | null;
  is_open_access: boolean | null;
  is_retracted: boolean | null;
  url: string | null;
  provenance: {
    retrieved_at: string;
    endpoint: string;
    provider_version?: string | null;
    query?: string | null;
  };
};

export type EvidenceSearchPage = {
  records: EvidenceRecord[];
  total: number | null;
  next_cursor: string | null;
  provider_version: string | null;
};
