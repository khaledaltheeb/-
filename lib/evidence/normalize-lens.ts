import type { LensScholarlyRecord } from '@/lib/lens/types';

export type NormalizedEvidenceRecord = {
  provider: 'lens';
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
  identifiers: Array<{ type: string; value: string }>;
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
  retractionUpdates: LensScholarlyRecord['retraction_updates'];
  attribution: {
    label: 'Data sourced from The Lens';
    url: 'https://www.lens.org/';
  };
};

function externalId(record: LensScholarlyRecord, wanted: string): string | null {
  const found = record.external_ids?.find((id) => id.type?.toLowerCase() === wanted.toLowerCase());
  return found?.value?.trim() || null;
}

function authorName(author: NonNullable<LensScholarlyRecord['authors']>[number]): string | null {
  if (author.collective_name?.trim()) return author.collective_name.trim();
  const joined = [author.first_name, author.last_name].filter(Boolean).join(' ').trim();
  return joined || null;
}

function openAccessUrls(record: LensScholarlyRecord): string[] {
  const locations = record.open_access?.locations;
  if (!locations) return [];
  const list = Array.isArray(locations) ? locations : [locations];
  return list.flatMap((location) => [
    ...(location.landing_page_urls ?? []),
    ...(location.pdf_urls ?? []),
  ]);
}

export function normalizeLensRecord(record: LensScholarlyRecord): NormalizedEvidenceRecord {
  const ids = (record.external_ids ?? [])
    .filter((id): id is { type: string; value: string } => Boolean(id.type?.trim() && id.value?.trim()))
    .map((id) => ({ type: id.type.trim(), value: id.value.trim() }));

  const sourceUrls = [
    ...(record.source_urls ?? []).map((item) => item.url).filter((url): url is string => Boolean(url)),
    ...openAccessUrls(record),
  ];

  return {
    provider: 'lens',
    providerId: record.lens_id?.trim() || null,
    title: record.title?.trim() || 'Untitled scholarly record',
    publicationType: record.publication_type?.trim() || null,
    publicationYear: Number.isFinite(record.year_published) ? record.year_published! : null,
    publicationDate: record.date_published?.trim() || null,
    journalOrSource: record.source?.title?.trim() || null,
    publisher: record.source?.publisher?.trim() || null,
    authors: (record.authors ?? []).map(authorName).filter((name): name is string => Boolean(name)),
    doi: externalId(record, 'doi'),
    pmid: externalId(record, 'pmid'),
    identifiers: ids,
    scholarlyCitations: Number.isFinite(record.scholarly_citations_count) ? record.scholarly_citations_count! : null,
    patentCitations: Number.isFinite(record.patent_citations_count) ? record.patent_citations_count! : null,
    referencesCount: Number.isFinite(record.references_count) ? record.references_count! : null,
    openAccess: Boolean(record.open_access),
    openAccessColour: record.open_access?.colour?.trim() || null,
    fieldsOfStudy: record.fields_of_study ?? [],
    keywords: record.keywords ?? [],
    meshTerms: (record.mesh_terms ?? []).map((term) => term.mesh_heading).filter((term): term is string => Boolean(term)),
    sourceUrls: [...new Set(sourceUrls)],
    isRetractedOrUpdated: Boolean(record.retraction_updates?.length),
    retractionUpdates: record.retraction_updates,
    attribution: {
      label: 'Data sourced from The Lens',
      url: 'https://www.lens.org/',
    },
  };
}

export function normalizeLensRecords(records: LensScholarlyRecord[] = []): NormalizedEvidenceRecord[] {
  return records.map(normalizeLensRecord);
}
