import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

const bundlePath = path.join(process.cwd(), 'data', 'legacy-static-assets-v1.json.gz');
const publicRoot = path.join(process.cwd(), 'public');
const expectedArtifactId = 9238517196;

const fail = (message) => {
  throw new Error(`LEGACY STATIC ASSET MATERIALIZATION FAILED: ${message}`);
};

if (!fs.existsSync(bundlePath)) fail(`bundle missing: ${bundlePath}`);

let manifest;
try {
  manifest = JSON.parse(zlib.gunzipSync(fs.readFileSync(bundlePath)).toString('utf8'));
} catch (error) {
  fail(`cannot decode bundle: ${error instanceof Error ? error.message : String(error)}`);
}

if (manifest?.version !== 1) fail(`unsupported manifest version: ${manifest?.version}`);
if (manifest?.source?.artifact_id !== expectedArtifactId) {
  fail(`unexpected production artifact id: ${manifest?.source?.artifact_id}`);
}
if (!manifest.assets || typeof manifest.assets !== 'object' || Array.isArray(manifest.assets)) {
  fail('assets map is missing');
}

let written = 0;
for (const [relativePath, entry] of Object.entries(manifest.assets)) {
  if (!relativePath || relativePath.startsWith('/') || relativePath.includes('..') || relativePath.includes('\\')) {
    fail(`unsafe relative path: ${relativePath}`);
  }
  if (!entry || typeof entry !== 'object') fail(`invalid entry: ${relativePath}`);

  let bytes;
  if (entry.encoding === 'utf-8') bytes = Buffer.from(entry.content ?? '', 'utf8');
  else if (entry.encoding === 'base64') bytes = Buffer.from(entry.content ?? '', 'base64');
  else fail(`unsupported encoding for ${relativePath}: ${entry.encoding}`);

  const digest = crypto.createHash('sha256').update(bytes).digest('hex');
  if (digest !== entry.sha256) fail(`sha256 mismatch for ${relativePath}`);
  if (bytes.length !== entry.size) fail(`size mismatch for ${relativePath}`);

  const destination = path.resolve(publicRoot, relativePath);
  const publicPrefix = `${path.resolve(publicRoot)}${path.sep}`;
  if (!destination.startsWith(publicPrefix)) fail(`path escaped public root: ${relativePath}`);

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, bytes);
  written += 1;
}

console.log(`Legacy static assets materialized: ${written} files from validated production artifact ${expectedArtifactId}.`);
