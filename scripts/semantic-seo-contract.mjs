import fs from 'node:fs';
import ts from 'typescript';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function requireAll(text, values, label) {
  for (const value of values) {
    if (!text.includes(value)) throw new Error(`${label}: missing ${value}`);
  }
}

const semantic = read('lib/semantic-seo.ts');
const semanticSafe = read('lib/semantic-seo-safe.ts');
const seo = read('lib/seo.ts');
const preservation = read('scripts/public-preservation-contract.mjs');

requireAll(semantic, [
  'SEO_TOPIC_KEYWORD_TARGET = 50',
  'SEO_SEARCH_INTENT_TARGET = 50',
  'SEO_TOTAL_KEYWORD_MINIMUM = 100',
  'buildSemanticSeoProfile',
  'topicKeywords',
  'searchIntents',
  'DOMAIN_TERMS',
  'DOMAIN_INTENT_FRAMES',
  "oncology:",
  "'mental-health':",
  'education:',
  'addiction:',
  'directory:',
  'tools:',
], 'semantic SEO profile');

requireAll(semanticSafe, [
  'buildBaseSemanticSeoProfile',
  'stabilizeExplicitPathDomain',
  "replace(/\\brecovery\\b/gi, 'improvement')",
  "replace(/التعافي/gu, 'التحسن')",
  'mental-health',
  'buildSemanticSeoProfile',
], 'semantic SEO ambiguity guard');

requireAll(seo, [
  'relatedTerms?: string[]',
  'searchIntents?: string[]',
  'Query maps remain private editorial inputs',
], 'SEO metadata contract');

// Semantic/query expansion is an internal editorial + CI instrument. It must not be rebuilt
// as dead work on every public metadata render, and it must never be emitted as meta keywords.
for (const forbidden of [
  "import { buildSemanticSeoProfile } from '@/lib/semantic-seo-safe'",
  'const semanticProfile = buildSemanticSeoProfile(input)',
  'const keywords = semanticProfile.topicKeywords',
  'keywords,',
]) {
  if (seo.includes(forbidden)) throw new Error(`SEO metadata render path must not contain semantic/meta-keyword work: ${forbidden}`);
}

// Never use hidden page copy or synthetic numbered filler to satisfy the inventory.
for (const forbidden of [
  'display:none',
  'visibility:hidden',
  'opacity:0',
  'aria-hidden="true" dangerouslySetInnerHTML',
  "'موضوع مرتبط'",
  "'related topic'",
  "'tema relacionado'",
  "'سؤال مهم عن'",
  "'important question about'",
  "'pregunta importante sobre'",
]) {
  if (semantic.includes(forbidden) || semanticSafe.includes(forbidden)) throw new Error(`semantic SEO profile: synthetic/hidden filler is forbidden: ${forbidden}`);
}

// Semantic generators used by editorial/CI tooling must remain non-throwing for incomplete
// expansion. Page rendering is deliberately decoupled from this machinery.
if (/throw new Error/.test(semantic) || /throw new Error/.test(semanticSafe)) {
  throw new Error('semantic SEO profile: semantic expansion must remain non-throwing');
}

// Execute the base TypeScript generator itself so the 50 + 50 internal rule is behavioral,
// not merely textual. Ambiguous recovery terms on explicit mental-health routes are handled
// by semantic-seo-safe.ts for tooling that imports the safe wrapper.
const transpiled = ts.transpileModule(semantic, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: 'semantic-seo.ts',
}).outputText;
const semanticModule = await import(`data:text/javascript;base64,${Buffer.from(transpiled).toString('base64')}`);

const samples = [
  {
    name: 'ar mental health',
    expectedLocale: 'ar', expectedDomain: 'mental-health',
    input: { title: 'القلق الاجتماعي', description: 'شرح موثوق لأعراض القلق الاجتماعي وأسبابه وتقييمه وعلاجه والدعم العملي.', path: '/content/social-anxiety', keywords: ['القلق الاجتماعي', 'اضطراب القلق الاجتماعي'] },
  },
  {
    name: 'ar pediatric oncology',
    expectedLocale: 'ar', expectedDomain: 'oncology',
    input: { title: 'ابيضاض الدم عند الأطفال', description: 'التشخيص والعلاج والرعاية الداعمة والمتابعة في سرطان الدم لدى الأطفال.', path: '/content/childhood-leukemia', keywords: ['ابيضاض الدم عند الأطفال', 'سرطان الدم عند الأطفال'] },
  },
  {
    name: 'ar inclusive education',
    expectedLocale: 'ar', expectedDomain: 'education',
    input: { title: 'دعم الطالب ذي التوحد في الصف', description: 'التكييفات الصفية والتواصل والخطة التربوية والممارسات القائمة على الدليل.', path: '/content/autism-classroom-support', keywords: ['التوحد في المدرسة', 'التربية الدامجة'] },
  },
  {
    name: 'ar addiction',
    expectedLocale: 'ar', expectedDomain: 'addiction',
    input: { title: 'منع الانتكاس في التعافي من الإدمان', description: 'المحفزات وخطة التعافي والدعم النفسي والأسري والمتابعة.', path: '/content/addiction-relapse-prevention', keywords: ['منع الانتكاس', 'التعافي من الإدمان'] },
  },
  {
    name: 'ar legal',
    expectedLocale: 'ar', expectedDomain: 'legal',
    input: { title: 'سياسة الخصوصية', description: 'حماية البيانات وحقوق المستخدم وإدارة المعلومات في منصة روافد.', path: '/privacy', keywords: ['سياسة الخصوصية', 'حماية البيانات'] },
  },
  {
    name: 'ar tools',
    expectedLocale: 'ar', expectedDomain: 'tools',
    input: { title: 'اختبار الذاكرة العاملة', description: 'أداة معرفية لقياس الأداء وفهم النتيجة وحدود التقييم.', path: '/cognitive-lab/working-memory', keywords: ['الذاكرة العاملة', 'تقييم معرفي'] },
  },
  {
    name: 'en mental health',
    expectedLocale: 'en', expectedDomain: 'mental-health',
    input: { title: 'Social anxiety disorder', description: 'Evidence-based information about symptoms, assessment, treatment and coping.', path: '/en/mental-health/social-anxiety', keywords: ['social anxiety disorder', 'social anxiety'] },
  },
  {
    name: 'en directory',
    expectedLocale: 'en', expectedDomain: 'directory',
    input: { title: 'Mental health specialists', description: 'How to find and verify qualified specialists and appropriate services.', path: '/en/specialists', keywords: ['mental health specialists', 'professional directory'] },
  },
  {
    name: 'es education',
    expectedLocale: 'es', expectedDomain: 'education',
    input: { title: 'Apoyo educativo para el autismo', description: 'Evaluación educativa, adaptaciones de aula, inclusión y apoyo familiar.', path: '/es/education/autism-support', keywords: ['autismo', 'educación inclusiva'] },
  },
  {
    name: 'es addiction',
    expectedLocale: 'es', expectedDomain: 'addiction',
    input: { title: 'Prevención de recaídas en la adicción', description: 'Tratamiento, recuperación, desencadenantes, apoyo familiar y seguimiento.', path: '/es/addiction/relapse-prevention', keywords: ['adicción', 'recuperación'] },
  },
  {
    name: 'general',
    expectedLocale: 'ar', expectedDomain: 'general',
    input: { title: 'عن روافد', description: 'منصة معرفية عربية للمعلومات الموثوقة والأدلة العملية والمصادر.', path: '/about', keywords: ['منصة معرفية عربية'] },
  },
];

for (const sample of samples) {
  const profile = semanticModule.buildSemanticSeoProfile(sample.input);
  if (profile.locale !== sample.expectedLocale) throw new Error(`${sample.name}: locale=${profile.locale}`);
  if (profile.domain !== sample.expectedDomain) throw new Error(`${sample.name}: domain=${profile.domain}`);
  if (profile.topicKeywords.length !== 50) throw new Error(`${sample.name}: topicKeywords=${profile.topicKeywords.length}, expected 50`);
  if (profile.searchIntents.length !== 50) throw new Error(`${sample.name}: searchIntents=${profile.searchIntents.length}, expected 50`);
  if (profile.keywords.length !== 100) throw new Error(`${sample.name}: keywords=${profile.keywords.length}, expected 100`);
  const unique = new Set(profile.keywords.map((value) => String(value).normalize('NFKC').toLocaleLowerCase(profile.locale).trim()));
  if (unique.size !== 100) throw new Error(`${sample.name}: only ${unique.size} raw-unique signals out of 100`);
  if (!profile.searchIntents.every((value) => String(value).includes(profile.primaryTopic))) {
    throw new Error(`${sample.name}: generated search intent lost the page primary topic`);
  }
}

// Preserve the existing hard no-loss gate for published/public content. The baseline may
// move upward as publishing continues, but it must never fall below the last verified floor.
requireAll(preservation, [
  'publicSectors: 9',
  'publicCategories: 126',
  'publishedContent:',
  'indexablePublishedContent:',
  'published content decreased',
  'indexable published content decreased',
  'public sectors decreased',
  'public categories decreased',
], 'public no-loss protection');

const publishedFloor = Number(preservation.match(/publishedContent:\s*(\d+)/)?.[1] ?? 0);
const indexableFloor = Number(preservation.match(/indexablePublishedContent:\s*(\d+)/)?.[1] ?? 0);
if (publishedFloor < 3752) {
  throw new Error(`public no-loss protection: published baseline regressed to ${publishedFloor}`);
}
if (indexableFloor < 3519) {
  throw new Error(`public no-loss protection: indexable published baseline regressed to ${indexableFloor}`);
}

console.log(`Semantic SEO contract: OK — ${samples.length} profiles produced exactly 50 topical signals + 50 domain-aware search intents in CI/editorial tooling, with no public meta-keywords emission or render-path semantic expansion.`);
