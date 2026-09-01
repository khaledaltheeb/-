import fs from 'node:fs';

const sdk = fs.readFileSync('sdk/typescript/rawafid-api.ts', 'utf8');
const readme = fs.readFileSync('sdk/typescript/README.md', 'utf8');
const policy = fs.readFileSync('docs/API_VERSIONING_AND_DEPRECATION.md', 'utf8');

for (const marker of [
  'export class RawafidClient',
  'export class RawafidApiError',
  "'/content'",
  "'/search'",
  "'/changes'",
  "'/sources'",
  'X-API-Key',
  "response.headers.get('retry-after')",
]) {
  if (!sdk.includes(marker)) throw new Error(`Missing SDK marker: ${marker}`);
}

for (const marker of [
  '/api/v1',
  'Deprecation',
  'Sunset',
  '/api/v2',
  'ETags',
  'HTTP 429',
]) {
  if (!policy.includes(marker)) throw new Error(`Missing versioning marker: ${marker}`);
}

if (!readme.includes('server') || !readme.includes('RAWAFID_API_KEY')) {
  throw new Error('SDK README must include server-side partner key guidance.');
}

console.log('Rawafid API SDK/versioning contract passed.');
