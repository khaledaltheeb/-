import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// One-shot vendoring is intentionally pinned, JSON-validated, and hash-verified before local persistence.
// IMPORTANT: repository-owned extension manifests are deliberately NOT vendored here.
// Re-vendoring the historical snapshot must never overwrite substance-waves.json or
// risk-evidence-manifest.json because those manifests now include post-snapshot waves.
const SOURCE_REPO = 'khaledaltheeb/healthrenewal.org';
const SOURCE_COMMIT = '00014486191027349cc083e824e545da186d74d1';
const SOURCE_ROOT = `https://raw.githubusercontent.com/${SOURCE_REPO}/${SOURCE_COMMIT}/data/addiction-atlas`;
const TARGET_DIR = path.resolve('data/addiction-atlas');

const FILES = {
  'methodology-v1.json': 'e6681eb285698037a6baa7c1a07a34b0b83673a9',
  'comparison-intents-v2.json': 'a19a7b885e3c90740d16f706bf3c47619471d8b3',
  'substances-v1.json': '3c058d49fe39fd280efb892b732a2da8c63d1c5c',
  'substances-v2.json': '189d44f685bfa9663fee9f1695d13e8a07e3504d',
  'substances-v3.json': 'c5b9368ff51b33dee1384feb0a4937f7e7ac50fd',
  'substances-v4.json': 'e5290b25ff5bfe1d2d25668df652db1fe6dda0e9',
  'substances-v5.json': 'ccdc5ce763fe9fb6a1236e6aa97df366c80fd2cf',
  'risk-evidence-v4.json': '4c3875a924dc6f59244a70b7e56b4264210eff10',
  'risk-evidence-v5.json': '2f402cf815c0e4d9f6cbe20d27b791feb1288013',
  'epidemiology-v1.json': '689dd4ccae674d0b69b1b7a72d9ad90a6586da53',
  'mortality-v1.json': '813e1f09b272fbbed38b95612848d5c061ec959b',
  'source-registry-v1.json': 'c777bcae96307a4d3afa953b298134beb6d70935',
};

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`);
  return createHash('sha1').update(header).update(buffer).digest('hex');
}

await mkdir(TARGET_DIR, { recursive: true });
for (const [file, expectedSha] of Object.entries(FILES)) {
  const response = await fetch(`${SOURCE_ROOT}/${file}`, { redirect: 'follow' });
  if (!response.ok) throw new Error(`${file}: source returned ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const actualSha = gitBlobSha(bytes);
  if (actualSha !== expectedSha) {
    throw new Error(`${file}: Git blob SHA mismatch; expected ${expectedSha}, got ${actualSha}`);
  }
  JSON.parse(bytes.toString('utf8'));
  await writeFile(path.join(TARGET_DIR, file), bytes);
  console.log(`vendored ${file} (${bytes.length} bytes, ${actualSha})`);
}

console.log(`Legacy Addiction Atlas snapshot files vendored from ${SOURCE_REPO}@${SOURCE_COMMIT}; extension manifests preserved.`);
