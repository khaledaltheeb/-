import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
let failed = false;
const fail = (message) => {
  console.error(`LEGACY STATIC ASSETS CONTRACT FAILED: ${message}`);
  failed = true;
};

const expectedStatic = [
  'api/v1/iris-learning-pathways.json',
  'api/v1/openapi.json',
  'api/v1/assistive-technology-resources.json',
  'api/v1/resna-ce-providers.json',
  'api/v1/assistive-technology-quality-framework.json',
  'api/v1/cochrane-resources.json',
  'api/v1/courses.schema.json',
  'api/v1/platform.json',
  'accessibility/evaluation.json',
  'api/adhd-world-federation-resources.json',
  'api/family-guide-v1-phase8.json',
  'api/family-guide-v2.json',
  'api/outside-the-box-evidence-standard-v301.json',
  'api/source-registry.json',
  'api/source-rights-registry.json',
  'api/v1/cochrane-evidence-academy.json',
  'api/v1/courses.example.json',
  'api/v1/iris-cited-guides.json',
  'sitemap-adhd.xml',
  'special-needs/conditions/cerebral-palsy/evidence.json',
  'special-needs/conditions/fragile-x-syndrome/evidence.json',
  'specialists-partners/data/provider-import-template-v2.csv',
];

const dynamicRoutes = [
  ['downloads/psychology-terms-ar.csv', 'app/downloads/psychology-terms-ar.csv/route.ts'],
  ['downloads/psychology-terms-ar.json', 'app/downloads/psychology-terms-ar.json/route.ts'],
  ['downloads/psychology-terms-ar.tsv', 'app/downloads/psychology-terms-ar.tsv/route.ts'],
  ['api/search-index.json', 'app/api/search-index.json/route.ts'],
];

const bundlePath = path.join(root, 'data', 'legacy-static-assets-v1.json.gz');
if (!fs.existsSync(bundlePath)) fail('compressed preservation bundle is missing');

let manifest;
try {
  manifest = JSON.parse(zlib.gunzipSync(fs.readFileSync(bundlePath)).toString('utf8'));
} catch (error) {
  fail(`cannot decode preservation bundle: ${error instanceof Error ? error.message : String(error)}`);
}

if (manifest?.version !== 1) fail('manifest version must be 1');
if (manifest?.source?.repository !== 'khaledaltheeb/healthrenewal.org') fail('legacy repository identity mismatch');
if (manifest?.source?.artifact_id !== 9238517196) fail('validated production artifact identity mismatch');

const actualStatic = Object.keys(manifest?.assets ?? {}).sort();
const wantedStatic = [...expectedStatic].sort();
if (JSON.stringify(actualStatic) !== JSON.stringify(wantedStatic)) {
  fail(`static asset set mismatch: expected ${wantedStatic.length}, got ${actualStatic.length}`);
}

try {
  execFileSync(process.execPath, ['scripts/materialize-legacy-static-assets.mjs'], { cwd: root, stdio: 'inherit' });
} catch {
  fail('materializer did not complete successfully');
}

for (const relativePath of expectedStatic) {
  const entry = manifest?.assets?.[relativePath];
  const publicPath = path.join(root, 'public', relativePath);
  if (!fs.existsSync(publicPath)) {
    fail(`materialized asset missing: /${relativePath}`);
    continue;
  }
  const bytes = fs.readFileSync(publicPath);
  const digest = crypto.createHash('sha256').update(bytes).digest('hex');
  if (digest !== entry?.sha256) fail(`materialized sha256 mismatch: /${relativePath}`);
  if (bytes.length !== entry?.size) fail(`materialized size mismatch: /${relativePath}`);
}

for (const [urlPath, sourcePath] of dynamicRoutes) {
  if (!fs.existsSync(path.join(root, sourcePath))) fail(`dynamic legacy asset route missing: /${urlPath}`);
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
for (const scriptName of ['dev', 'build', 'preview', 'deploy', 'upload']) {
  if (!pkg.scripts?.[scriptName]?.includes('materialize-legacy-static-assets.mjs')) {
    fail(`package script ${scriptName} does not materialize preserved assets`);
  }
}
if (!pkg.scripts?.['legacy-static-assets:validate']?.includes('legacy-static-assets-contract.mjs')) {
  fail('legacy-static-assets:validate script is missing');
}
if (!pkg.scripts?.['architecture-check']?.includes('legacy-static-assets:validate')) {
  fail('architecture-check does not enforce legacy static asset preservation');
}

if (failed) process.exit(1);
console.log(`Legacy static assets contract passed: ${expectedStatic.length} validated production assets plus ${dynamicRoutes.length} live dynamic routes preserve all 26 historical machine-readable URLs.`);
