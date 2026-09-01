import { requestJson } from '@/lib/research-integrations/http';

const ROR_API_BASE = 'https://api.ror.org/v2/organizations';
const ROR_PATTERN = /^0[a-hj-km-np-tv-z0-9]{6}[0-9]{2}$/;

type JsonRecord = Record<string, unknown>;
export type RorStatus = 'active' | 'inactive' | 'withdrawn';
export type RorResolutionMethod = 'api_affiliation' | 'dataset_exact_name' | 'dataset_domain' | 'manual';

export type RorOrganization = {
  ror_id: string;
  display_name: string;
  status: RorStatus | null;
  domains: string[];
  types: string[];
  schema_version: string | null;
  relationships: Array<{ id: string; type: string; label: string | null }>;
};

export type RorMatch = {
  organization: RorOrganization;
  chosen: boolean;
  matching_type: string | null;
  score: number | null;
  method: RorResolutionMethod;
  strategy: 'single_search' | 'dataset_exact';
};

function record(value: unknown): JsonRecord | null { return value && typeof value === 'object' && !Array.isArray(value) ? value as JsonRecord : null; }
function text(value: unknown) { return typeof value === 'string' && value.trim() ? value.trim() : null; }
function asArray(value: unknown) { return Array.isArray(value) ? value : []; }

export function normalizeRorId(value: string) {
  const trimmed = value.trim().toLowerCase().replace(/^https?:\/\/(?:www\.)?ror\.org\//, '').replace(/^ror\.org\//, '').replace(/\/$/, '');
  if (!ROR_PATTERN.test(trimmed)) throw new TypeError('Invalid ROR identifier.');
  return `https://ror.org/${trimmed}`;
}

function displayName(row: JsonRecord) {
  for (const item of asArray(row.names)) {
    const name = record(item);
    const types = asArray(name?.types).filter((type): type is string => typeof type === 'string');
    if (types.includes('ror_display')) return text(name?.value) || '';
  }
  return asArray(row.names).map(record).map((name) => text(name?.value)).find(Boolean) || '';
}

export function normalizeRorOrganization(value: unknown): RorOrganization | null {
  const row = record(value);
  const id = text(row?.id);
  if (!row || !id) return null;
  let rorId: string;
  try { rorId = normalizeRorId(id); } catch { return null; }
  const admin = record(row.admin);
  const lastModified = record(admin?.last_modified);
  return {
    ror_id: rorId,
    display_name: displayName(row),
    status: ['active', 'inactive', 'withdrawn'].includes(String(row.status)) ? row.status as RorStatus : null,
    domains: asArray(row.domains).filter((item): item is string => typeof item === 'string'),
    types: asArray(row.types).filter((item): item is string => typeof item === 'string'),
    schema_version: text(lastModified?.schema_version),
    relationships: asArray(row.relationships).flatMap((item) => {
      const relationship = record(item);
      const relId = text(relationship?.id);
      const type = text(relationship?.type);
      if (!relId || !type) return [];
      try { return [{ id: normalizeRorId(relId), type, label: text(relationship?.label) }]; } catch { return []; }
    }),
  };
}

export async function matchRorAffiliation(affiliation: string): Promise<RorMatch | null> {
  const value = affiliation.trim();
  if (value.length < 2 || value.length > 1_000) throw new TypeError('ROR affiliation must contain 2-1000 characters.');
  const params = new URLSearchParams({ affiliation: value });
  params.append('single_search', '');
  const response = await requestJson<JsonRecord>({ provider: 'ROR', url: `${ROR_API_BASE}?${params.toString()}` });
  const candidates = asArray(response.items).flatMap((item) => {
    const candidate = record(item);
    const organization = normalizeRorOrganization(candidate?.organization);
    if (!candidate || !organization) return [];
    return [{ candidate, organization }];
  });
  const selected = candidates.find(({ candidate }) => candidate.chosen === true);
  if (!selected) return null;
  const score = Number(selected.candidate.score);
  return {
    organization: selected.organization,
    chosen: true,
    matching_type: text(selected.candidate.matching_type),
    score: Number.isFinite(score) ? score : null,
    method: 'api_affiliation',
    strategy: 'single_search',
  };
}

export async function getRorOrganization(rorId: string, allStatus = true): Promise<RorOrganization | null> {
  const full = normalizeRorId(rorId);
  const id = full.split('/').pop() as string;
  const suffix = allStatus ? '?all_status' : '';
  const response = await requestJson<JsonRecord>({ provider: 'ROR', url: `${ROR_API_BASE}/${id}${suffix}` });
  return normalizeRorOrganization(response);
}

export type RorDatasetIndex = {
  by_name: Map<string, RorOrganization[]>;
  by_domain: Map<string, RorOrganization[]>;
};

function normalizeName(value: string) {
  return value.normalize('NFKC').trim().toLocaleLowerCase('en').replace(/[\p{P}\p{S}]+/gu, ' ').replace(/\s+/g, ' ');
}

export function buildRorDatasetIndex(records: unknown[]): RorDatasetIndex {
  const byName = new Map<string, RorOrganization[]>();
  const byDomain = new Map<string, RorOrganization[]>();
  for (const value of records) {
    const raw = record(value);
    const organization = normalizeRorOrganization(value);
    if (!raw || !organization) continue;
    for (const item of asArray(raw.names)) {
      const name = record(item);
      const valueText = text(name?.value);
      if (!valueText) continue;
      const key = normalizeName(valueText);
      const list = byName.get(key) || [];
      if (!list.some((existing) => existing.ror_id === organization.ror_id)) list.push(organization);
      byName.set(key, list);
    }
    for (const domain of organization.domains) {
      const key = domain.trim().toLowerCase();
      const list = byDomain.get(key) || [];
      if (!list.some((existing) => existing.ror_id === organization.ror_id)) list.push(organization);
      byDomain.set(key, list);
    }
  }
  return { by_name: byName, by_domain: byDomain };
}

export function resolveRorFromDataset(index: RorDatasetIndex, input: { name?: string | null; domain?: string | null }): RorMatch | null {
  const domain = input.domain?.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '');
  if (domain) {
    const matches = index.by_domain.get(domain) || [];
    if (matches.length === 1) return { organization: matches[0], chosen: true, matching_type: 'EXACT DOMAIN', score: 1, method: 'dataset_domain', strategy: 'dataset_exact' };
  }
  const name = input.name?.trim();
  if (name) {
    const matches = index.by_name.get(normalizeName(name)) || [];
    if (matches.length === 1) return { organization: matches[0], chosen: true, matching_type: 'EXACT NAME', score: 1, method: 'dataset_exact_name', strategy: 'dataset_exact' };
  }
  return null;
}
