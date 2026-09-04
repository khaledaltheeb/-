import fs from 'node:fs';

const seo = fs.readFileSync('lib/seo.ts', 'utf8');

if (/\bkeywords\s*,/.test(seo) || /\bkeywords\s*:\s*semanticProfile/.test(seo)) {
  throw new Error('Public SEO metadata must not emit meta keywords.');
}

if (!/keywords\?:\s*string\[\]/.test(seo)) {
  throw new Error('SeoMetadataInput should keep internal keyword inputs for editorial/search-intent compatibility.');
}

if (!/buildSemanticSeoProfile\(input\)/.test(seo)) {
  throw new Error('Internal semantic SEO signal generation must remain available to the metadata architecture.');
}

if (!/const keywords = semanticProfile\.topicKeywords\.slice\(0, 12\)/.test(seo)) {
  throw new Error('The existing bounded internal semantic keyword projection must remain intact for architecture compatibility.');
}

console.log('No-public-meta-keywords contract passed: semantic signals remain internal and are not returned through Next Metadata.');
