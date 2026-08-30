export type EvidenceProviderId = 'lens' | 'openalex' | 'pubmed' | 'crossref' | 'manual';

export type EvidenceIdentifier = {
  type: string;
  value: string;
};

export type EvidenceAttribution = {
  label: string;
  url: string;
};

export type EvidenceSearchOptions = {
  query: string;
  size?: number;
  offset?: number;
  yearFrom?: number;
  yearTo?: number;
  publicationTypes?: string[];
  openAccessOnly?: boolean;
  includeRetracted?: boolean;
};

export type NormalizedEvidenceRecord = {
  provider: EvidenceProviderId;
  providerId: string | null;
  title: string;
  publicationType: string | null;
  publicationYear: number | null;
  publicationDate: string | null;
  journalOrSource: string | null;
  publisher: string | null;
  authors: string[];
  doi: string | null;
  pmid: string | null;
  identifiers: EvidenceIdentifier[];
  scholarlyCitations: number | null;
  patentCitations: number | null;
  referencesCount: number | null;
  openAccess: boolean;
  openAccessColour: string | null;
  fieldsOfStudy: string[];
  keywords: string[];
  meshTerms: string[];
  sourceUrls: string[];
  isRetractedOrUpdated: boolean;
  retractionUpdates?: unknown[];
  attribution: EvidenceAttribution;
};

export type EvidenceSearchResult = {
  provider: EvidenceProviderId;
  query: string;
  total: number;
  records: NormalizedEvidenceRecord[];
  attribution: EvidenceAttribution;
  limits?: Record<string, string | null> | null;
  fetchedAt: string;
};

export interface EvidenceProvider {
  id: EvidenceProviderId;
  isConfigured(): boolean;
  search(options: EvidenceSearchOptions): Promise<EvidenceSearchResult>;
}
