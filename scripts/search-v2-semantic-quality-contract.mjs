const required = process.env.RAWAFID_SEARCH_SEMANTIC_CONTRACT_REQUIRED === '1';
const baseUrl = process.env.SUPABASE_URL;
const jwt = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!baseUrl || !jwt) {
  if (required) {
    console.error('SEARCH_V2_SEMANTIC_FAIL missing SUPABASE_URL/JWT');
    process.exit(1);
  }
  console.log('SEARCH_V2_SEMANTIC_SKIP missing endpoint credentials');
  process.exit(0);
}

const cases = [
  {
    q: 'كيف اساعد طفلي على القراءة',
    topK: 5,
    accept: (rows) => rows.some((row) =>
      String(row.destination ?? '').includes('child-dyslexia-parent-guide') ||
      String(row.destination ?? '').includes('reading-difficulties-at-home') ||
      /دعم|مساعدة|طفل|المنزل/.test(String(row.title ?? ''))
    ),
  },
  {
    q: 'كيف اعرف ان ابني مصاب بالتوحد',
    topK: 5,
    accept: (rows) => {
      const autismRows = rows.filter((row) => /توحد/.test(String(row.title ?? ''))).length;
      const offIntent = rows.filter((row) => /سرطان|أورام|كيماوي/.test(String(row.title ?? ''))).length;
      return autismRows >= 3 && offIntent === 0;
    },
  },
  {
    q: 'ابني عنده توحد ماذا افعل',
    topK: 5,
    accept: (rows) => rows.some((row) => /دعم|رعاية|تدخل|تقييم|أسرة|والد/.test(String(row.title ?? ''))),
  },
  {
    q: 'طفلي عمره سنتين ولا يتكلم',
    topK: 3,
    accept: (rows) => rows.some((row) => String(row.destination ?? '').includes('two-year-old-not-talking')),
  },
  {
    q: 'الفرق بين الخجل والقلق الاجتماعي',
    topK: 5,
    accept: (rows) => rows.some((row) => /خجل.*قلق اجتماعي|قلق اجتماعي.*خجل/.test(String(row.title ?? ''))),
  },
];

const endpoint = `${baseUrl.replace(/\/$/, '')}/functions/v1/rawafid-hybrid-search`;
let failed = 0;
let semanticRanksSeen = 0;

for (const test of cases) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${jwt}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ q: test.q, limit: 10 }),
  });

  if (!response.ok) {
    failed += 1;
    console.error(`FAIL ${test.q} HTTP ${response.status}`);
    continue;
  }

  const payload = await response.json();
  const rows = Array.isArray(payload?.results) ? payload.results : [];
  const window = rows.slice(0, test.topK);
  semanticRanksSeen += window.filter((row) => row.semantic_rank != null).length;

  const modeOk = payload?.mode === 'hybrid';
  const unique = new Set(rows.map((row) => row.destination)).size === rows.length;
  const relevant = test.accept(window);

  if (!modeOk || !unique || !relevant) {
    failed += 1;
    console.error(`FAIL ${test.q}`, {
      mode: payload?.mode,
      unique,
      relevant,
      top: window.map((row) => ({
        title: row.title,
        destination: row.destination,
        lexical_rank: row.lexical_rank,
        semantic_rank: row.semantic_rank,
      })),
    });
  } else {
    console.log(`PASS ${test.q} mode=${payload.mode} elapsed=${payload.elapsed_ms}ms`);
  }
}

if (semanticRanksSeen === 0) {
  failed += 1;
  console.error('FAIL no semantic-ranked result was observed; corpus embeddings are not active');
}

console.log(`SEARCH_V2_SEMANTIC_SUMMARY cases=${cases.length} failed=${failed} semantic_rank_hits=${semanticRanksSeen}`);
if (failed > 0) process.exit(1);
