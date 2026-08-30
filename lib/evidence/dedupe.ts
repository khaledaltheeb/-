import type { NormalizedEvidenceRecord } from '@/lib/evidence/types';

function normalizeDoi(value: string | null): string | null {
  if (!value) return null;
  return value.trim().toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//, '').replace(/^doi:\s*/, '') || null;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export function evidenceDeduplicationKey(record: NormalizedEvidenceRecord): string {
  const doi = normalizeDoi(record.doi);
  if (doi) return `doi:${doi}`;
  if (record.pmid?.trim()) return `pmid:${record.pmid.trim().toLowerCase()}`;
  if (record.providerId?.trim()) return `${record.provider}:${record.providerId.trim().toLowerCase()}`;
  return `fallback:${record.publicationYear ?? 'na'}:${normalizeText(record.title)}`;
}

export function deduplicateEvidence(records: NormalizedEvidenceRecord[]): NormalizedEvidenceRecord[] {
  const byKey = new Map<string, NormalizedEvidenceRecord>();
  for (const record of records) {
    const key = evidenceDeduplicationKey(record);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, record);
      continue;
    }

    const score = (item: NormalizedEvidenceRecord) =>
      Number(Boolean(item.doi)) * 8 +
      Number(Boolean(item.pmid)) * 6 +
      item.sourceUrls.length * 2 +
      Number(item.openAccess) * 2 +
      Number(Boolean(item.journalOrSource)) +
      Number(Boolean(item.publisher));

    if (score(record) > score(existing)) byKey.set(key, record);
  }
  return [...byKey.values()];
}
