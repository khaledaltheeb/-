import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const requireText = (text, needle, message) => {
  if (!text.includes(needle)) throw new Error(message);
};
const forbidText = (text, needle, message) => {
  if (text.includes(needle)) throw new Error(message);
};

const arabicPage = read('app/developers/page.tsx');
const englishPage = read('app/en/developers/page.tsx');
const workflow = read('.github/workflows/developer-api-live-verification.yml');

for (const [label, page] of [['Arabic', arabicPage], ['English', englishPage]]) {
  requireText(page, 'index: true', `${label} developer documentation must remain indexable`);
  requireText(page, 'follow: true', `${label} developer documentation must remain followable`);
}

requireText(
  workflow,
  'github.event.workflow_run.head_sha || github.sha',
  'live verification must bind to the SHA produced by the successful production deployment',
);
requireText(
  workflow,
  "^x-robots-tag:.*noindex",
  'live verification must reject an actual X-Robots-Tag noindex header on human documentation',
);
requireText(
  workflow,
  '<meta[^>]+name="robots"',
  'live verification must inspect the actual robots meta element',
);
forbidText(
  workflow,
  "grep -qi 'noindex' \"$out\"",
  'live verification must not treat explanatory documentation text containing noindex as a page directive',
);

for (const marker of [
  'https://healthrenewal.org/developers',
  'https://healthrenewal.org/en/developers',
  'https://healthrenewal.org/api/openapi.json',
  'https://healthrenewal.org/api/v1/content?limit=1',
  'https://healthrenewal.org/api/v1/search?q=autism&limit=2',
  'https://healthrenewal.org/api/v1/changes?since=2026-09-01T00:00:00Z&limit=2',
  'https://healthrenewal.org/api/v1/sources?limit=1',
  'https://healthrenewal.org/api/v1/sectors?limit=1&offset=0',
  'https://healthrenewal.org/api/v1/articles?limit=1',
  'https://healthrenewal.org/api/v1/stats',
  'https://healthrenewal.org/api/v1/lens',
  "test \"$options_status\" = '204'",
  "test \"$conditional_status\" = '304'",
]) {
  requireText(workflow, marker, `developer live workflow missing contract marker: ${marker}`);
}

console.log('Developer API live verification static contract passed.');
