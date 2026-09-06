import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PAVS_TSV = 'https://raw.githubusercontent.com/bio-ontology-research-group/hpo-arabic/master/hpo_arabic_translations.tsv';
const CACHE_MS = 24 * 60 * 60 * 1000;
const MAX_QUERY = 120;

type Term = {
  id: string;
  english: string;
  arabic: string;
  layArabic: string;
  definition: string;
  source: 'PAVS Arabic HPO';
};

let cachedTerms: Term[] | null = null;
let cachedAt = 0;

function normalize(value: string) {
  return value
    .toLocaleLowerCase('ar')
    .normalize('NFKD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[^\p{L}\p{N}:]+/gu, ' ')
    .trim();
}

function splitTsvLine(line: string) {
  return line.split('\t').map((cell) => cell.trim());
}

async function loadTerms() {
  if (cachedTerms && Date.now() - cachedAt < CACHE_MS) return cachedTerms;

  const response = await fetch(PAVS_TSV, {
    headers: { Accept: 'text/tab-separated-values,text/plain;q=0.9,*/*;q=0.1' },
    next: { revalidate: 86400 },
  });
  if (!response.ok) throw new Error(`PAVS HPO source unavailable: ${response.status}`);

  const body = await response.text();
  const rows = body.split(/\r?\n/).filter(Boolean);
  const header = splitTsvLine(rows.shift() ?? '');
  const index = Object.fromEntries(header.map((name, position) => [name, position]));

  const terms = rows.map((line): Term | null => {
    const cells = splitTsvLine(line);
    const id = cells[index.id] ?? '';
    if (!/^HP:\d{7}$/.test(id)) return null;
    return {
      id,
      english: cells[index.english_technical_name] ?? '',
      arabic: cells[index.arabic_technical_name] ?? '',
      layArabic: cells[index.arabic_layperson_synonym] ?? '',
      definition: cells[index.arabic_definition] ?? '',
      source: 'PAVS Arabic HPO',
    };
  }).filter((term): term is Term => Boolean(term));

  cachedTerms = terms;
  cachedAt = Date.now();
  return terms;
}

function score(term: Term, query: string) {
  const q = normalize(query);
  if (!q) return 0;
  const fields = [term.id, term.arabic, term.layArabic, term.english].map(normalize);
  let best = 0;
  for (const field of fields) {
    if (!field) continue;
    if (field === q) best = Math.max(best, 100);
    else if (field.startsWith(q)) best = Math.max(best, 80);
    else if (field.includes(q)) best = Math.max(best, 60);
    else {
      const tokens = q.split(' ').filter((token) => token.length > 1);
      const matches = tokens.filter((token) => field.includes(token)).length;
      if (matches) best = Math.max(best, 20 + Math.round((matches / tokens.length) * 35));
    }
  }
  return best;
}

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') ?? '').trim().slice(0, MAX_QUERY);
  if (q.length < 2) return NextResponse.json({ query: q, results: [], source: 'PAVS Arabic HPO' });

  try {
    const terms = await loadTerms();
    const results = terms
      .map((term) => ({ term, score: score(term, q) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score || a.term.id.localeCompare(b.term.id))
      .slice(0, 20)
      .map(({ term }) => term);

    return NextResponse.json(
      { query: q, results, source: 'PAVS Arabic HPO', source_url: 'https://github.com/bio-ontology-research-group/hpo-arabic' },
      { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=3600, stale-while-revalidate=86400' } },
    );
  } catch {
    return NextResponse.json(
      { query: q, results: [], source: 'PAVS Arabic HPO', error: 'تعذر تحميل قاموس HPO العربي مؤقتًا.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
