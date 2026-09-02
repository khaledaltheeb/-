const required = process.env.RAWAFID_SEARCH_V3_CONTRACT_REQUIRED === '1';
const baseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!baseUrl || !secretKey) {
  if (required) {
    console.error('SEARCH_V3_CONTRACT_FAIL missing SUPABASE_URL/backend secret');
    process.exit(1);
  }
  console.log('SEARCH_V3_CONTRACT_SKIP missing production search credentials');
  process.exit(0);
}

const cases = [
  {
    q: 'كيف اساعد طفلي على القراءة',
    top1: '/family-guide/learning-support/reading-difficulties-at-home/',
    topKTerms: ['reading', 'dyslexia'],
  },
  {
    q: 'كيف اعرف ان ابني مصاب بالتوحد',
    top1: '/encyclopedia/concept-1142/',
    top5TitleTerms: ['التوحد'],
  },
  {
    q: 'طفلي لا يتكلم',
    top1: '/quick-info/two-year-old-not-talking/',
    forbiddenTop5: ['down-syndrome'],
  },
  {
    q: 'مرض نادر علاج جيني',
    top1: '/content/rare-disease-gene-cell-therapy-guide',
    top5TitleTerms: ['نادر', 'الجيني'],
  },
  {
    q: 'علامات ADHD عند الاطفال',
    topK: 5,
    requiredLatin: 'adhd',
  },
  {
    q: 'AAC للتوحد',
    top1: '/care-guides/aac/autism-guide/',
    requiredLatin: 'aac',
  },
  {
    q: 'ERP للوسواس القهري',
    top1: '/library/therapies/exposure-response-prevention/',
    requiredLatin: 'erp',
  },
  {
    q: 'اعراض انسحاب الكحول',
    top1: '/content/alcohol-withdrawal-safety',
    forbiddenTop5: ['benzodiazepine-withdrawal-taper-safety'],
    forbiddenRankBefore: 5,
  },
];

const endpoint = `${baseUrl.replace(/\/$/, '')}/rest/v1/rpc/search_platform_v3_lexical`;
let failed = 0;
let totalMs = 0;

function normalized(value) {
  return String(value ?? '').toLocaleLowerCase('ar');
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

  const rows = await response.json();
  const top5 = rows.slice(0, 5);
  const destinations = top5.map((row) => String(row.destination ?? ''));
  const titles = top5.map((row) => normalized(row.title));
  const unique = new Set(rows.map((row) => row.destination)).size === rows.length;

  let ok = rows.length > 0 && unique;
  if (test.top1) ok &&= rows[0]?.destination === test.top1;
  if (test.top5TitleTerms) ok &&= test.top5TitleTerms.every((term) => titles.every((title) => title.includes(normalized(term))));
  if (test.requiredLatin) {
    const token = test.requiredLatin.toLowerCase();
    ok &&= top5.every((row) => normalized(`${row.title} ${row.destination}`).includes(token));
  }
  if (test.topKTerms) {
    ok &&= top5.some((row) => test.topKTerms.some((term) => normalized(`${row.title} ${row.destination}`).includes(term)));
  }
  if (test.forbiddenTop5) {
    const cutoff = Math.max(0, Math.min(test.forbiddenRankBefore ?? 5, 5));
    ok &&= !destinations.slice(0, cutoff).some((destination) => test.forbiddenTop5.some((term) => destination.includes(term)));
  }

  if (!ok) {
    failed += 1;
    console.error(`FAIL ${test.q}`, top5.map((row) => ({ title: row.title, destination: row.destination })));
  } else {
    console.log(`PASS ${test.q} ${Math.round(elapsed)}ms`);
  }
}

console.log(`SEARCH_V3_CONTRACT_SUMMARY cases=${cases.length} failed=${failed} avg_ms=${Math.round(totalMs / cases.length)}`);
if (failed > 0) process.exit(1);
