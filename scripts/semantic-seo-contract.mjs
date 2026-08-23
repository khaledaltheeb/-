import fs from 'node:fs';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function requireAll(text, values, label) {
  for (const value of values) {
    if (!text.includes(value)) throw new Error(`${label}: missing ${value}`);
  }
}

const semantic = read('lib/semantic-seo.ts');
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

requireAll(seo, [
  "import { buildSemanticSeoProfile } from '@/lib/semantic-seo'",
  'relatedTerms?: string[]',
  'searchIntents?: string[]',
  'const semanticProfile = buildSemanticSeoProfile(input)',
  'const keywords = semanticProfile.keywords',
], 'SEO metadata integration');

if (/slice\(0,\s*20\)/.test(seo)) {
  throw new Error('SEO metadata integration: legacy 20-keyword truncation returned');
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
  if (semantic.includes(forbidden)) throw new Error(`semantic SEO profile: synthetic/hidden filler is forbidden: ${forbidden}`);
}

// Runtime metadata generation must not remove a public page just because semantic expansion
// is incomplete. Validation belongs here in CI, not in page rendering.
if (/throw new Error/.test(semantic)) {
  throw new Error('semantic SEO profile: runtime SEO generation must remain non-throwing');
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

console.log('Semantic SEO contract: OK — 50 topical signals + 50 domain-aware search intents, no synthetic filler, with published-page preservation enforced.');
