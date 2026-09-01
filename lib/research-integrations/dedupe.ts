import type { EvidenceRecord } from '@/lib/research-integrations/types';

function keys(record: EvidenceRecord) {
  const values = [
    record.identifiers.doi ? `doi:${record.identifiers.doi.trim().toLowerCase()}` : null,
    record.identifiers.pmid ? `pmid:${record.identifiers.pmid.trim()}` : null,
    record.identifiers.pmcid ? `pmcid:${record.identifiers.pmcid.trim().toUpperCase()}` : null,
    record.identifiers.lens ? `lens:${record.identifiers.lens.trim()}` : null,
  ].filter((value): value is string => Boolean(value));
  if (!values.length && record.title) values.push(`title:${record.title.normalize('NFKC').trim().toLowerCase()}`);
  return values;
}

function merge(left: EvidenceRecord, right: EvidenceRecord): EvidenceRecord {
  return {
    ...left,
    abstract: left.abstract || right.abstract,
    publication_type: left.publication_type || right.publication_type,
    publication_year: left.publication_year || right.publication_year,
    publication_date: left.publication_date || right.publication_date,
    journal: left.journal || right.journal,
    publisher: left.publisher || right.publisher,
    authors: left.authors.length >= right.authors.length ? left.authors : right.authors,
    identifiers: { ...right.identifiers, ...left.identifiers },
    cited_by_count: Math.max(left.cited_by_count ?? 0, right.cited_by_count ?? 0) || null,
    is_open_access: left.is_open_access === true || right.is_open_access === true ? true : left.is_open_access ?? right.is_open_access,
    is_retracted: left.is_retracted === true || right.is_retracted === true,
    url: left.url || right.url,
  };
}

export function deduplicateEvidence(records: EvidenceRecord[]) {
  const output: EvidenceRecord[] = [];
  const lookup = new Map<string, number>();
  for (const item of records) {
    const itemKeys = keys(item);
    const found = itemKeys.map((key) => lookup.get(key)).find((value): value is number => value !== undefined);
    if (found === undefined) {
      const index = output.push(item) - 1;
      for (const key of itemKeys) lookup.set(key, index);
      continue;
    }
    output[found] = merge(output[found], item);
    for (const key of keys(output[found])) lookup.set(key, found);
  }
  return output;
}
