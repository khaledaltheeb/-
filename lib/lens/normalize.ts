import type { LensScholarlyRecord } from './types';

export type EvidenceIdentifier = {
  type: string;
  value: string;
};

export type NormalizedEvidenceRecord = {
  provider: 'lens';
  provider_record_id: string | null;
  title: string;
  year: number | null;
  publication_type: string | null;
  source_title: string | null;
  publisher: string | null;
  authors: string[];
  identifiers: EvidenceIdentifier[];
  doi: string | null;
  pmid: string | null;
  citations: number | null;
  patent_citations: number | null;
  references: number | null;
  open_access: boolean;
  open_access_license: string | null;
  fields_of_study: string[];
  keywords: string[];
  source_urls: string[];
  is_retracted_or_updated: boolean;
};

function clean(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized || null;
}

function authorName(author: LensScholarlyRecord['authors'] extends Array<infer T> ? T : never): string | null {
  if (!author || typeof author !== 'object') return null;
  const collective = clean(author.collective_name);
  if (collective) return collective;
  const parts = [clean(author.first_name), clean(author.last_name)].filter(Boolean);
  return parts.length ? parts.join(' ') : null;
}

function identifiers(record: LensScholarlyRecord): EvidenceIdentifier[] {
  const values = Array.isArray(record.external_ids) ? record.external_ids : [];
  const seen = new Set<string>();
  const result: EvidenceIdentifier[] = [];
  for (const item of values) {
    const type = clean(item?.type)?.toLowerCase();
    const value = clean(item?.value);
    if (!type || !value) continue;
    const key = `${type}:${value.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ type, value });
  }
  return result;
}

export function normalizeLensRecord(record: LensScholarlyRecord): NormalizedEvidenceRecord | null {
  const title = clean(record.title);
  if (!title) return null;

  const ids = identifiers(record);
  const findId = (type: string) => ids.find((item) => item.type === type)?.value ?? null;
  const urls = Array.isArray(record.source_urls)
    ? record.source_urls.map((item) => clean(item?.url)).filter((value): value is string => Boolean(value))
    : [];

  return {
    provider: 'lens',
    provider_record_id: clean(record.lens_id),
    title,
    year: Number.isFinite(record.year_published) ? Number(record.year_published) : null,
    publication_type: clean(record.publication_type),
    source_title: clean(record.source?.title),
    publisher: clean(record.source?.publisher),
    authors: Array.isArray(record.authors)
      ? record.authors.map(authorName).filter((value): value is string => Boolean(value))
      : [],
    identifiers: ids,
    doi: findId('doi'),
    pmid: findId('pmid'),
    citations: Number.isFinite(record.scholarly_citations_count) ? Number(record.scholarly_citations_count) : null,
    patent_citations: Number.isFinite(record.patent_citations_count) ? Number(record.patent_citations_count) : null,
    references: Number.isFinite(record.references_count) ? Number(record.references_count) : null,
    open_access: Boolean(record.open_access),
    open_access_license: clean(record.open_access?.license),
    fields_of_study: Array.isArray(record.fields_of_study) ? record.fields_of_study.filter((x): x is string => typeof x === 'string') : [],
    keywords: Array.isArray(record.keywords) ? record.keywords.filter((x): x is string => typeof x === 'string') : [],
    source_urls: [...new Set(urls)],
    is_retracted_or_updated: Array.isArray(record.retraction_updates) && record.retraction_updates.length > 0,
  };
}

export function normalizeLensRecords(records: LensScholarlyRecord[]): NormalizedEvidenceRecord[] {
  return records.map(normalizeLensRecord).filter((record): record is NormalizedEvidenceRecord => Boolean(record));
}
