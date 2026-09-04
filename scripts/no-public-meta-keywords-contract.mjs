import fs from 'node:fs';

const seo = fs.readFileSync('lib/seo.ts', 'utf8');

if (/\bkeywords\s*,/.test(seo) || /\bkeywords\s*:\s*semanticProfile/.test(seo)) {
  throw new Error('Public SEO metadata must not emit meta keywords.');
}

if (!/keywords\?:\s*string\[\]/.test(seo)) {
  throw new Error('SeoMetadataInput should keep internal keyword inputs for editorial/search-intent compatibility.');
}

if (/buildSemanticSeoProfile\(/.test(seo)) {
  throw new Error('buildSeoMetadata must not compute semantic keyword profiles solely for public meta keywords.');
}

console.log('No-public-meta-keywords contract passed.');
