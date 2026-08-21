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

const partNames = [
  'legacy-static-assets-v3.chunk01.b64',
  'legacy-static-assets-v3.chunk02.b64',
  'legacy-static-assets-v3.prefix03.b64',
  'legacy-static-assets-v2.part2.b64',
  'legacy-static-assets-v2.part3.b64',
  'legacy-static-assets-v3.tail4a1.b64',
  'legacy-static-assets-v3.tail4a2.b64',
  'legacy-static-assets-v2.part4b.b64',
];
const expectedBase64Length = 53548;
const expectedBundleBytes = 40161;
const expectedBundleSha256 = '52fd3325d0f5df9e8d5c528407e59c61bdeec054b73c5251fc4e27703134a683';

let base64 = '';
for (const name of partNames) {
  const partPath = path.join(root, 'data', name);
  if (!fs.existsSync(partPath)) {
    fail(`preservation bundle part missing: data/${name}`);
    continue;
  }
  base64 += fs.readFileSync(partPath, 'utf8').trim();
}

if (base64.length !== expectedBase64Length) fail(`base64 length mismatch: expected ${expectedBase64Length}, got ${base64.length}`);
if (base64 && !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) fail('preservation bundle is not valid base64');

let compressed = Buffer.alloc(0);
if (base64) compressed = Buffer.from(base64, 'base64');
if (compressed.length !== expectedBundleBytes) fail(`gzip size mismatch: expected ${expectedBundleBytes}, got ${compressed.length}`);
const bundleDigest = crypto.createHash('sha256').update(compressed).digest('hex');
if (bundleDigest !== expectedBundleSha256) fail(`gzip sha256 mismatch: expected ${expectedBundleSha256}, got ${bundleDigest}`);

let manifest;
try {
  manifest = JSON.parse(zlib.gunzipSync(compressed).toString('utf8'));
} catch (error) {
  fail(`cannot decode preservation bundle: ${error instanceof Error ? error.message : String(error)}`);
}

if (manifest?.version !== 1) fail('manifest version must be 1');
if (manifest?.source?.repository !== 'khaledaltheeb/healthrenewal.org') fail('legacy repository identity mismatch');
if (manifest?.source?.artifact_id !== 9238517196) fail('validated production artifact identity mismatch');
if (manifest?.source?.legacy_source_sha !== '5a48c4bc4abb1b63b05fac64580a3463759b41b5') fail('legacy source sha mismatch');
if (manifest?.source?.artifact_digest !== 'sha256:e657d2cde228c281d6fca80f130f15f06fc2791d344724d929d897cf2590158f') fail('production artifact digest mismatch');

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
if (!pkg.scripts?.['legacy-static-assets:validate']?.includes('legacy-static-assets-contract.mjs')) fail('legacy-static-assets:validate script is missing');
if (!pkg.scripts?.['architecture-check']?.includes('legacy-static-assets:validate')) fail('architecture-check does not enforce legacy static asset preservation');

if (failed) process.exit(1);
console.log(`Legacy static assets contract passed: ${expectedStatic.length} validated production assets plus ${dynamicRoutes.length} live dynamic routes preserve all 26 historical machine-readable URLs.`);
