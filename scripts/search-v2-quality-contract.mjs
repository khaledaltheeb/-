const required = process.env.RAWAFID_SEARCH_CONTRACT_REQUIRED === '1';
const baseUrl = process.env.SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!baseUrl || !secretKey) {
  if (required) {
    console.error('SEARCH_V2_CONTRACT_FAIL missing SUPABASE_URL/backend secret');
    process.exit(1);
  }
  console.log('SEARCH_V2_CONTRACT_SKIP missing production search credentials');
  process.exit(0);
}

const cases = [
  {
    q: 'التوحد',
    paths: ['/special-needs/autism/', '/sections/autism'],
    topK: 3,
  },
  {
    q: 'علامات التوحد',
    paths: ['/encyclopedia/concept-1142/', '/special-needs/autism-signs-by-age/'],
    topK: 5,
  },
  {
    q: 'طفلي لا يتكلم',
    paths: ['/quick-info/two-year-old-not-talking/', '/comparisons/speech-delay-vs-autism/'],
    topK: 5,
  },
  {
    q: 'تأخر الكلام',
    pathTerms: ['speech-delay', 'late-talking'],
    titleTerms: ['تأخر الكلام', 'تأخر النطق'],
    topK: 5,
  },
  {
    q: 'عسر القراءة',
    pathTerms: ['dyslexia'],
    titleTerms: ['عسر القراءة'],
    topK: 5,
  },
  {
    q: 'علاج القلق الاجتماعي',
    pathTerms: ['social-anxiety'],
    titleTerms: ['القلق الاجتماعي', 'الرهاب الاجتماعي'],
    topK: 5,
  },
  {
    q: 'كيف اعرف ان ابني مصاب بالتوحد',
    titleTerms: ['التوحد', 'توحد'],
    topK: 5,
    minResults: 5,
  },
  {
    q: 'كيف اساعد طفلي على القراءة',
    titleTerms: ['القراءة', 'عسر القراءة'],
    topK: 5,
    minResults: 5,
  },
  {
    q: 'اكتئاب بعد الولادة',
    titleTerms: ['الاكتئاب', 'اكتئاب'],
    topK: 5,
    minResults: 1,
  },
];

const endpoint = `${baseUrl.replace(/\/$/, '')}/rest/v1/rpc/search_platform_v2_lexical`;
let failed = 0;
let totalMs = 0;

function matchCase(test, results) {
  const window = results.slice(0, test.topK ?? 5);
  if ((test.minResults ?? 1) > results.length) return false;

  if (test.paths?.some((path) => window.some((row) => row.destination === path))) return true;
  if (test.pathTerms?.some((term) => window.some((row) => String(row.destination ?? '').includes(term)))) return true;
  if (test.titleTerms?.some((term) => window.some((row) => String(row.title ?? '').includes(term)))) return true;
  return false;
}

for (const test of cases) {
  const started = performance.now();
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      apikey: secretKey,
      authorization: `Bearer ${secretKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ p_query: test.q, p_limit: 10 }),
  });
  const elapsed = performance.now() - started;
  totalMs += elapsed;

  if (!response.ok) {
    failed += 1;
    console.error(`FAIL ${test.q} HTTP ${response.status}`);
    continue;
  }

  const results = await response.json();
  const uniqueDestinations = new Set(results.map((row) => row.destination));
  const noDuplicates = uniqueDestinations.size === results.length;
  const relevant = matchCase(test, results);

  if (!relevant || !noDuplicates) {
    failed += 1;
    console.error(`FAIL ${test.q}`, {
      relevant,
      noDuplicates,
      count: results.length,
      top: results.slice(0, 5).map((row) => ({ title: row.title, destination: row.destination })),
    });
  } else {
    console.log(`PASS ${test.q} ${Math.round(elapsed)}ms`);
  }
}

const avgMs = totalMs / cases.length;
console.log(`SEARCH_V2_CONTRACT_SUMMARY cases=${cases.length} failed=${failed} avg_ms=${Math.round(avgMs)}`);
if (failed > 0) process.exit(1);
