import fs from 'node:fs';

const config = fs.readFileSync('next.config.ts', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const fail = (message) => { console.error(`LEGACY INTERACTIVE ROUTE CONTRACT FAILED: ${message}`); process.exitCode = 1; };

const expected = [
  ['/ai-search', '/search'],
  ['/specialists-partners/account', '/account'],
  ['/specialists-partners/admin', '/admin'],
  ['/specialists-partners/contact', '/specialists'],
  ['/specialists-partners/join', '/join'],
  ['/specialists-partners/password-reset', '/reset-password'],
  ['/specialists-partners/portal', '/messages'],
  ['/specialists-partners/recover', '/forgot-password'],
];
for (const [source, destination] of expected) {
  if (!config.includes(`source: '${source}'`) || !config.includes(`destination: '${destination}'`)) fail(`missing route ${source} -> ${destination}`);
}
if (!config.includes('...legacyInteractiveRedirects')) fail('interactive legacy routes must be registered as one explicit migration group');
if (!pkg.scripts?.['legacy-interactive-routes:validate']) fail('package validation script missing');
if (!process.exitCode) console.log('Legacy interactive route contract passed: AI search and 7 specialist/account surfaces resolve to current functional equivalents.');
