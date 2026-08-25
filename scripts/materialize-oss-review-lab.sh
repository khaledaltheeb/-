#!/usr/bin/env bash
set -euo pipefail

OSS_REPO_URL="https://github.com/khaledaltheeb/rawafid-arabic-rtl-a11y-toolkit.git"
OSS_SHA="${RAWAFID_OSS_REVIEW_SHA:-60338f509826fdb001f9f871ae01b7d15f63192b}"
TARGET_DIR="${RAWAFID_OSS_REVIEW_TARGET:-public/opensource/rtl-lab}"
TMP_ROOT="$(mktemp -d)"
OSS_DIR="${TMP_ROOT}/rawafid-oss"

cleanup() {
  rm -rf "${TMP_ROOT}"
}
trap cleanup EXIT

printf 'Materializing Rawafid OSS review lab from %s at %s\n' "${OSS_REPO_URL}" "${OSS_SHA}"

git clone --filter=blob:none --no-checkout "${OSS_REPO_URL}" "${OSS_DIR}"
git -C "${OSS_DIR}" checkout --detach "${OSS_SHA}"
resolved_sha="$(git -C "${OSS_DIR}" rev-parse HEAD)"
if [ "${resolved_sha}" != "${OSS_SHA}" ]; then
  echo "Resolved OSS commit ${resolved_sha} does not match required ${OSS_SHA}." >&2
  exit 1
fi

npm --prefix "${OSS_DIR}" ci --no-audit --no-fund
npm --prefix "${OSS_DIR}" run site:check
npm --prefix "${OSS_DIR}" run site:build

rm -rf "${TARGET_DIR}"
mkdir -p "${TARGET_DIR}"
cp -R "${OSS_DIR}/review-site/." "${TARGET_DIR}/"

RAWAFID_OSS_REVIEW_TARGET="${TARGET_DIR}" node <<'NODE'
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const target = process.env.RAWAFID_OSS_REVIEW_TARGET;
const manifestPath = path.join(target, 'artifact-manifest.json');
const manifestBytes = readFileSync(manifestPath);
const manifest = JSON.parse(manifestBytes.toString('utf8'));

if (
  manifest.schemaVersion !== 1
  || manifest.artifact !== 'rawafid-public-review-lab'
  || manifest.package?.name !== '@rawafid/arabic-rtl-a11y-toolkit'
  || manifest.entrypoint !== 'review-lab/index.html'
  || manifest.deploymentModel !== 'static-files-subpath-safe'
  || !Array.isArray(manifest.files)
  || manifest.files.length === 0
) {
  throw new Error('Copied review-site manifest does not match the expected Rawafid artifact contract.');
}

for (const entry of manifest.files) {
  if (typeof entry.path !== 'string' || entry.path.startsWith('/') || entry.path.includes('..')) {
    throw new Error(`Unsafe copied artifact path: ${entry.path}`);
  }
  const bytes = readFileSync(path.join(target, entry.path));
  const digest = createHash('sha256').update(bytes).digest('hex');
  if (bytes.byteLength !== entry.bytes || digest !== entry.sha256) {
    throw new Error(`Copied artifact integrity mismatch: ${entry.path}`);
  }
}

const manifestDigest = createHash('sha256').update(manifestBytes).digest('hex');
console.log(`Pinned OSS review lab copied and verified: ${manifest.files.length} payload files; manifest SHA-256 ${manifestDigest}`);
NODE
