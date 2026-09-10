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
  'Curated SEO profile',
  'keywords?: string[]',
  'relatedTerms?: string[]',
  'searchIntents?: string[]',
  'buildSemanticSeoProfile',
  'topicKeywords',
  'searchIntents',
  'function unique',
  'does not invent keywords or search queries',
], 'curated semantic SEO profile');

requireAll(semanticSafe, [
  'buildBaseSemanticSeoProfile',
  'stabilizeExplicitPathDomain',
  "replace(/\\brecovery\\b/gi, 'improvement')",
  "replace(/التعافي/gu, 'التحسن')",
  'mental-health',
  'buildSemanticSeoProfile',
], 'semantic SEO ambiguity guard');

requireAll(seo, [
  "import { buildSemanticSeoProfile } from '@/lib/semantic-seo-safe'",
  'relatedTerms?: string[]',
  'searchIntents?: string[]',
  'const semanticProfile = buildSemanticSeoProfile(input)',
  'const manualKeywords = curatedKeywords(input.keywords)',
  'keywords: manualKeywords',
], 'SEO metadata integration');

// Public keyword metadata must come from explicit page-level editorial input only.
for (const forbidden of [
  'SEO_TOPIC_KEYWORD_TARGET = 50',
  'SEO_SEARCH_INTENT_TARGET = 50',
  'SEO_TOTAL_KEYWORD_MINIMUM = 100',
  'DOMAIN_TERMS',
  'DOMAIN_INTENT_FRAMES',
  'GENERIC_INTENT_FRAMES',
]) {
  if (semantic.includes(forbidden)) {
    throw new Error(`curated semantic SEO profile: automatic quota/expansion is forbidden: ${forbidden}`);
  }
}

// Never use hidden copy or synthetic filler to manufacture search relevance.
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
  if (semantic.includes(forbidden) || semanticSafe.includes(forbidden)) {
    throw new Error(`curated semantic SEO profile: synthetic/hidden filler is forbidden: ${forbidden}`);
  }
}

// Runtime metadata generation must not remove a public page because its keyword set is incomplete.
if (/throw new Error/.test(semantic) || /throw new Error/.test(semanticSafe)) {
  throw new Error('curated semantic SEO profile: runtime SEO generation must remain non-throwing');
}

// Execute the TypeScript generator itself: it must preserve human-curated terms, deduplicate
// them, and must never inflate them to an arbitrary count.
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
    input: {
      title: 'القلق الاجتماعي',
      description: 'شرح موثوق لأعراض القلق الاجتماعي وأسبابه وتقييمه وعلاجه والدعم العملي.',
      path: '/content/social-anxiety',
      keywords: ['القلق الاجتماعي', 'اضطراب القلق الاجتماعي', 'القلق الاجتماعي'],
      relatedTerms: ['أعراض القلق الاجتماعي'],
      searchIntents: ['ما أعراض القلق الاجتماعي', 'كيف يعالج القلق الاجتماعي'],
    },
    expectedTopics: 3,
    expectedIntents: 2,
  },
  {
    name: 'ar pediatric oncology',
    expectedLocale: 'ar', expectedDomain: 'oncology',
    input: {
      title: 'ابيضاض الدم عند الأطفال',
      description: 'التشخيص والعلاج والرعاية الداعمة والمتابعة في سرطان الدم لدى الأطفال.',
      path: '/content/childhood-leukemia',
      keywords: ['ابيضاض الدم عند الأطفال', 'سرطان الدم عند الأطفال'],
      searchIntents: ['أعراض سرطان الدم عند الأطفال', 'علاج اللوكيميا عند الأطفال'],
    },
    expectedTopics: 2,
    expectedIntents: 2,
  },
  {
    name: 'en directory',
    expectedLocale: 'en', expectedDomain: 'directory',
    input: {
      title: 'Mental health specialists',
      description: 'How to find and verify qualified specialists and appropriate services.',
      path: '/en/specialists',
      keywords: ['mental health specialists', 'psychologist directory'],
      searchIntents: ['find a mental health specialist'],
    },
    expectedTopics: 2,
    expectedIntents: 1,
  },
  {
    name: 'general with no manual keywords',
    expectedLocale: 'ar', expectedDomain: 'general',
    input: { title: 'عن روافد', description: 'منصة معرفية عربية للمعلومات الموثوقة والأدلة العملية والمصادر.', path: '/about' },
    expectedTopics: 0,
    expectedIntents: 0,
  },
];

for (const sample of samples) {
  const profile = semanticModule.buildSemanticSeoProfile(sample.input);
  if (profile.locale !== sample.expectedLocale) throw new Error(`${sample.name}: locale=${profile.locale}`);
  if (profile.domain !== sample.expectedDomain) throw new Error(`${sample.name}: domain=${profile.domain}`);
  if (profile.topicKeywords.length !== sample.expectedTopics) throw new Error(`${sample.name}: topicKeywords=${profile.topicKeywords.length}`);
  if (profile.searchIntents.length !== sample.expectedIntents) throw new Error(`${sample.name}: searchIntents=${profile.searchIntents.length}`);
  if (profile.keywords.length !== sample.expectedTopics + sample.expectedIntents) throw new Error(`${sample.name}: combined=${profile.keywords.length}`);
}

// Preserve the hard no-loss gate for published/public content. The baseline may move upward
// as publishing continues, but it must never fall below the last verified floor.
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

console.log(`Semantic SEO contract: OK — curated page keywords and real search-intent phrases are preserved without automatic quota expansion or hidden filler.`);
