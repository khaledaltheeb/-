import { NextRequest, NextResponse } from 'next/server';

const PAVS_PHENOTYPE_ENDPOINT = 'https://pavs.phenomebrowser.net/api/search/phenotype';
const HPO_ID = /^HP:\d{7}$/;

export const runtime = 'edge';

type RequestBody = {
  hpoIds?: unknown;
  method?: unknown;
  limit?: unknown;
  includeSaudi?: unknown;
  includeDDD?: unknown;
  includeLiterature?: unknown;
  onlyDiagnosed?: unknown;
};

export async function POST(request: NextRequest) {
  let body: RequestBody;
  try { body = await request.json() as RequestBody; }
  catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  const hpoIds = Array.isArray(body.hpoIds)
    ? [...new Set(body.hpoIds.map((value) => String(value).trim()).filter((value) => HPO_ID.test(value)))].slice(0, 30)
    : [];
  if (!hpoIds.length) return NextResponse.json({ error: 'at_least_one_valid_hpo_required' }, { status: 400 });

  const method = body.method === 'resnik' ? 'resnik' : 'lin';
  const requestedLimit = Number(body.limit);
  const limit = Number.isFinite(requestedLimit) ? Math.min(200, Math.max(10, Math.floor(requestedLimit))) : 100;
  const upstreamBody = {
    hpo_ids: hpoIds,
    method,
    limit,
    include_saudi: body.includeSaudi !== false,
    include_ddd: body.includeDDD === true,
    include_literature: body.includeLiterature !== false,
    only_diagnosed: body.onlyDiagnosed === true,
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const upstream = await fetch(PAVS_PHENOTYPE_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Rawafid-Rare-Phenotype-Navigator/1.0',
      },
      body: JSON.stringify(upstreamBody),
      signal: controller.signal,
      cache: 'no-store',
    });
    if (!upstream.ok) return NextResponse.json({ error: 'pavs_source_unavailable' }, { status: 502 });
    const raw = await upstream.json() as unknown;
    const rows = Array.isArray(raw) ? raw : [];
    const items = rows.slice(0, limit).map((row) => {
      const record = row && typeof row === 'object' ? row as Record<string, unknown> : {};
      return {
        id: String(record.id || ''),
        gene: String(record.gene || ''),
        disease: String(record.disease || ''),
        suggestedDisease: String(record.suggested_disease || ''),
        source: String(record.source || ''),
        score: Number(record.score || 0),
        isSaudi: Boolean(record.is_saudi),
      };
    });
    return NextResponse.json({ items, source: 'PAVS', query: upstreamBody });
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json({ error: aborted ? 'pavs_source_timeout' : 'pavs_source_error' }, { status: 502 });
  } finally {
    clearTimeout(timer);
  }
}
