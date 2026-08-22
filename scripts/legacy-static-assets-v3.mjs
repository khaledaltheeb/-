import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

const root = process.cwd();
const publicRoot = path.join(root, 'public');
const expectedBase64Length = 53548;
const expectedBundleBytes = 40161;
const expectedBundleSha256 = '52fd3325d0f5df9e8d5c528407e59c61bdeec054b73c5251fc4e27703134a683';
const partNames = Array.from({ length: 11 }, (_, index) =>
  `legacy-static-assets-v3.chunk${String(index + 1).padStart(2, '0')}.b64`,
);

export const expectedStatic = [
  'api/v1/iris-learning-pathways.json','api/v1/openapi.json','api/v1/assistive-technology-resources.json','api/v1/resna-ce-providers.json','api/v1/assistive-technology-quality-framework.json','api/v1/cochrane-resources.json','api/v1/courses.schema.json','api/v1/platform.json','accessibility/evaluation.json','api/adhd-world-federation-resources.json','api/family-guide-v1-phase8.json','api/family-guide-v2.json','api/outside-the-box-evidence-standard-v301.json','api/source-registry.json','api/source-rights-registry.json','api/v1/cochrane-evidence-academy.json','api/v1/courses.example.json','api/v1/iris-cited-guides.json','sitemap-adhd.xml','special-needs/conditions/cerebral-palsy/evidence.json','special-needs/conditions/fragile-x-syndrome/evidence.json','specialists-partners/data/provider-import-template-v2.csv',
];

export const dynamicRoutes = [
  ['downloads/psychology-terms-ar.csv','app/downloads/psychology-terms-ar.csv/route.ts'],
  ['downloads/psychology-terms-ar.json','app/downloads/psychology-terms-ar.json/route.ts'],
  ['downloads/psychology-terms-ar.tsv','app/downloads/psychology-terms-ar.tsv/route.ts'],
  ['api/search-index.json','app/api/search-index.json/route.ts'],
];

const fail = (message) => { throw new Error(`LEGACY STATIC ASSETS FAILED: ${message}`); };

export function loadManifest() {
  const parts = partNames.map((name) => {
    const p = path.join(root, 'data', name);
    if (!fs.existsSync(p)) fail(`bundle part missing: data/${name}`);
    return fs.readFileSync(p, 'utf8').trim();
  });
  const base64 = parts.join('');
  if (base64.length !== expectedBase64Length) fail(`base64 length mismatch: expected ${expectedBase64Length}, got ${base64.length}`);
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) fail('bundle is not valid base64');
  const compressed = Buffer.from(base64, 'base64');
  if (compressed.length !== expectedBundleBytes) fail(`gzip size mismatch: expected ${expectedBundleBytes}, got ${compressed.length}`);
  const digest = crypto.createHash('sha256').update(compressed).digest('hex');
  if (digest !== expectedBundleSha256) fail(`gzip sha256 mismatch: expected ${expectedBundleSha256}, got ${digest}`);
  const manifest = JSON.parse(zlib.gunzipSync(compressed).toString('utf8'));
  if (manifest?.version !== 1) fail('manifest version mismatch');
  if (manifest?.source?.repository !== 'khaledaltheeb/healthrenewal.org') fail('legacy repository identity mismatch');
  if (manifest?.source?.artifact_id !== 9238517196) fail('validated production artifact identity mismatch');
  if (manifest?.source?.legacy_source_sha !== '5a48c4bc4abb1b63b05fac64580a3463759b41b5') fail('legacy source sha mismatch');
  if (manifest?.source?.artifact_digest !== 'sha256:e657d2cde228c281d6fca80f130f15f06fc2791d344724d929d897cf2590158f') fail('artifact digest mismatch');
  const actual = Object.keys(manifest?.assets ?? {}).sort();
  const wanted = [...expectedStatic].sort();
  if (JSON.stringify(actual) !== JSON.stringify(wanted)) fail(`static asset set mismatch: expected ${wanted.length}, got ${actual.length}`);
  return manifest;
}

export function materialize() {
  const manifest = loadManifest();
  let written = 0;
  for (const [relativePath, entry] of Object.entries(manifest.assets)) {
    const bytes = entry.encoding === 'utf-8' ? Buffer.from(entry.content ?? '', 'utf8') : entry.encoding === 'base64' ? Buffer.from(entry.content ?? '', 'base64') : fail(`unsupported encoding: ${relativePath}`);
    const digest = crypto.createHash('sha256').update(bytes).digest('hex');
    if (digest !== entry.sha256 || bytes.length !== entry.size) fail(`asset checksum/size mismatch: ${relativePath}`);
    const destination = path.resolve(publicRoot, relativePath);
    if (!destination.startsWith(`${path.resolve(publicRoot)}${path.sep}`)) fail(`path escaped public root: ${relativePath}`);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, bytes);
    written += 1;
  }
  if (written !== 22) fail(`expected 22 assets, wrote ${written}`);
  console.log(`Legacy static assets materialized: ${written} checksum-verified production files.`);
  return manifest;
}

export function validateContract() {
  const manifest = materialize();
  for (const relativePath of expectedStatic) {
    const entry = manifest.assets[relativePath];
    const p = path.join(publicRoot, relativePath);
    if (!fs.existsSync(p)) fail(`materialized asset missing: /${relativePath}`);
    const bytes = fs.readFileSync(p);
    const digest = crypto.createHash('sha256').update(bytes).digest('hex');
    if (digest !== entry.sha256 || bytes.length !== entry.size) fail(`materialized verification mismatch: /${relativePath}`);
  }
  for (const [urlPath, sourcePath] of dynamicRoutes) if (!fs.existsSync(path.join(root, sourcePath))) fail(`dynamic route missing: /${urlPath}`);
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  for (const name of ['dev','build','preview','deploy','upload']) if (!pkg.scripts?.[name]?.includes('materialize-legacy-static-assets.mjs')) fail(`package script ${name} does not materialize assets`);
  if (!pkg.scripts?.['legacy-static-assets:validate']?.includes('legacy-static-assets-contract.mjs')) fail('validation script missing');
  if (!pkg.scripts?.['architecture-check']?.includes('legacy-static-assets:validate')) fail('architecture-check does not enforce preservation');
  console.log(`Legacy static assets contract passed: ${expectedStatic.length} static assets plus ${dynamicRoutes.length} dynamic routes preserve all 26 historical machine-readable URLs.`);
}
