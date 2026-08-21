import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

const root = process.cwd();
const publicRoot = path.join(root, 'public');
const expectedBase64Length = 53548;
const expectedBundleBytes = 40161;
const expectedBundleSha256 = '52fd3325d0f5df9e8d5c528407e59c61bdeec054b73c5251fc4e27703134a683';
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

const fail = (message) => {
  throw new Error(`LEGACY STATIC ASSET MATERIALIZATION FAILED: ${message}`);
};

const partPaths = partNames.map((name) => path.join(root, 'data', name));
for (const partPath of partPaths) {
  if (!fs.existsSync(partPath)) fail(`bundle part missing: ${path.relative(root, partPath)}`);
}

const base64 = partPaths.map((partPath) => fs.readFileSync(partPath, 'utf8').trim()).join('');
if (base64.length !== expectedBase64Length) {
  fail(`base64 length mismatch: expected ${expectedBase64Length}, got ${base64.length}`);
}
if (!/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) fail('bundle parts are not valid base64');

const compressed = Buffer.from(base64, 'base64');
if (compressed.length !== expectedBundleBytes) {
  fail(`gzip size mismatch: expected ${expectedBundleBytes}, got ${compressed.length}`);
}
const bundleDigest = crypto.createHash('sha256').update(compressed).digest('hex');
if (bundleDigest !== expectedBundleSha256) {
  fail(`gzip sha256 mismatch: expected ${expectedBundleSha256}, got ${bundleDigest}`);
}

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

let written = 0;
for (const [relativePath, entry] of Object.entries(manifest?.assets ?? {})) {
  if (!entry || typeof entry !== 'object') fail(`invalid manifest entry: ${relativePath}`);
  let bytes;
  if (entry.encoding === 'utf-8') bytes = Buffer.from(entry.content ?? '', 'utf8');
  else if (entry.encoding === 'base64') bytes = Buffer.from(entry.content ?? '', 'base64');
  else fail(`unsupported encoding for ${relativePath}`);

  const digest = crypto.createHash('sha256').update(bytes).digest('hex');
  if (digest !== entry.sha256) fail(`sha256 mismatch before write: ${relativePath}`);
  if (bytes.length !== entry.size) fail(`size mismatch before write: ${relativePath}`);

  const destination = path.resolve(publicRoot, relativePath);
  const publicPrefix = `${path.resolve(publicRoot)}${path.sep}`;
  if (!destination.startsWith(publicPrefix)) fail(`path escaped public root: ${relativePath}`);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, bytes);
  written += 1;
}

if (written !== 22) fail(`expected 22 preserved assets, materialized ${written}`);
console.log(`Legacy static assets materialized: ${written} checksum-verified production files.`);
