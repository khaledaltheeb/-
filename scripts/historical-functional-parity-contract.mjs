import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
let bad = false;
const fail = (message) => {
  console.error(`HISTORICAL PARITY CONTRACT FAILED: ${message}`);
  bad = true;
};

const required = [
  'app/assessments/page.tsx',
  'app/assessments/[slug]/page.tsx',
  'lib/historical-cognitive-tests.ts',
  'app/cognitive-tests/page.tsx',
  'app/cognitive-tests/[slug]/page.tsx',
];

for (const path of required) {
  if (!fs.existsSync(path)) fail(`missing ${path}`);
}

for (const obsolete of ['lib/historical-assessments.ts', 'components/historical-assessment-runner.tsx']) {
  if (fs.existsSync(obsolete)) fail(`obsolete parallel assessment runtime still exists: ${obsolete}`);
}

if (!bad) {
  const assessmentsHub = read('app/assessments/page.tsx');
  const assessmentAliases = read('app/assessments/[slug]/page.tsx');
  const cognitiveMappings = read('lib/historical-cognitive-tests.ts');
  const cognitiveHub = read('app/cognitive-tests/page.tsx');
  const cognitivePage = read('app/cognitive-tests/[slug]/page.tsx');

  for (const marker of [
    '/assessment-lab',
    '/assessment-measures',
    '/core-outcome-sets',
    '/guided-assessment',
    'الصدق والثبات',
    'التكييف العربي',
    'درجة واحدة لا تصف الشخص كاملًا',
  ]) {
    if (!assessmentsHub.includes(marker)) fail(`assessment methodology hub missing marker: ${marker}`);
  }

  const canonicalMappings = {
    "'gad-7'": '/assessment-lab/gad-7-plus',
    "'phq-9'": '/assessment-lab/phq-9-plus',
    "'who-5'": '/assessment-lab/who-5-plus',
  };

  if (!assessmentAliases.includes('permanentRedirect')) {
    fail('historical assessment aliases must use permanent redirects to their single canonical representation');
  }
  for (const [slug, destination] of Object.entries(canonicalMappings)) {
    if (!assessmentAliases.includes(slug) || !assessmentAliases.includes(destination)) {
      fail(`historical assessment alias mapping missing: ${slug} -> ${destination}`);
    }
  }
  if (/HistoricalAssessmentRunner|historical-assessments/.test(assessmentsHub + assessmentAliases)) {
    fail('parallel historical assessment runtime must not be imported after canonical takeover');
  }

  const cognitiveRoutes = [
    'digit-span-forward',
    'matrix-patterns',
    'two-back',
    'number-series',
    'simple-reaction',
    'mental-rotation',
    'stroop-basic',
    'verbal-analogy',
  ];
  for (const value of cognitiveRoutes) {
    if (!cognitiveMappings.includes(value)) fail(`cognitive mapping missing ${value}`);
  }

  if (!cognitiveHub.includes("path:'/cognitive-lab'") || !cognitiveHub.includes('index:true') || !cognitiveHub.includes('follow:true')) {
    fail('historical cognitive hub must be index/follow and canonicalize to /cognitive-lab');
  }
  if (!cognitiveHub.includes('مسارات تاريخية محفوظة') || !cognitiveHub.includes('/cognitive-lab')) {
    fail('historical cognitive hub must clearly identify Cognitive Lab as the current reference');
  }

  if (!cognitivePage.includes('CognitiveLabRunner') || !cognitivePage.includes('ContentRenderer')) {
    fail('historical cognitive route must run the real task and preserve original text');
  }
  if (!cognitivePage.includes("path:`/cognitive-lab/${mapped}`") || !cognitivePage.includes('index:true') || !cognitivePage.includes('follow:true')) {
    fail('historical cognitive detail routes must canonicalize to their Cognitive Lab tool and remain index/follow');
  }
  if (!cognitivePage.includes('المرجع الحالي: Cognitive Lab')) {
    fail('historical cognitive detail route must explain the current reference surface');
  }
  if (/permanentRedirect|\bredirect\s*\(/.test(cognitivePage)) {
    fail('historical cognitive routes must remain functional in place rather than redirecting');
  }
}

if (bad) process.exit(1);
console.log('Historical functional parity contract passed: assessments use one canonical representation with 3 preserved redirects; 8 cognitive aliases remain functional, index/follow, and canonicalized to Cognitive Lab.');
