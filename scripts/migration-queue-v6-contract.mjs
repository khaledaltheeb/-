#!/usr/bin/env node

import fs from 'node:fs';
import zlib from 'node:zlib';

const queueFile = new URL('../data/migration-v6/legacy-queue.v6.json.gz', import.meta.url);
const queue = JSON.parse(zlib.gunzipSync(fs.readFileSync(queueFile)).toString('utf8'));
const records = Array.isArray(queue.records) ? queue.records : [];
const failures = [];
const sha256 = /^[0-9a-f]{64}$/;
const fail = (message) => failures.push(message);

if (queue.summary?.contract_version !== 6) fail('summary contract_version must equal 6');
if (queue.summary?.record_count !== records.length) fail('summary record_count does not match records');
if (records.length < 852) fail(`legacy queue lost published routes: found ${records.length}, expected at least 852`);
if (queue.contract?.copy_and_paste_forbidden !== true) fail('copy-and-paste prohibition is missing');
if (queue.contract?.encyclopedia_migrated_last !== true) fail('encyclopedia-last contract is missing');

const paths = new Set();
let previousOrder = -Infinity;
let encyclopediaStarted = false;
for (const [index, record] of records.entries()) {
  if (!record.source_path || paths.has(record.source_path)) fail(`duplicate or empty source_path at ${index}`);
  paths.add(record.source_path);
  if (Number(record.priority_order) < previousOrder) fail(`queue order regressed at ${record.source_path}`);
  previousOrder = Number(record.priority_order);

  const encyclopedia = record.priority_lane === 'encyclopedia-last';
  if (encyclopedia) encyclopediaStarted = true;
  else if (encyclopediaStarted) fail(`non-encyclopedia record appears after final lane: ${record.source_path}`);
  if (encyclopedia && (!record.encyclopedia_deferred || record.migration_state !== 'deferred-by-owner-order')) {
    fail(`encyclopedia record is not explicitly deferred: ${record.source_path}`);
  }

  const interactive = record.priority_lane === 'interactive-quality' || record.source_kind === 'resource';
  if (!interactive && record.target_minimum_words !== 2500) fail(`editorial minimum is not 2500: ${record.source_path}`);
  if (interactive && record.target_minimum_words !== 0) fail(`interactive content must use the tested-quality exemption: ${record.source_path}`);
  if (record.disclaimer_policy?.route !== '/disclaimer'
    || record.disclaimer_policy?.label !== 'إخلاء المسؤولية والتنبيهات'
    || record.disclaimer_policy?.inline_warning_blocks_allowed !== false) {
    fail(`central disclaimer policy is incomplete: ${record.source_path}`);
  }

  const versions = Array.isArray(record.source_versions_to_review) ? record.source_versions_to_review : [];
  if (!versions.length) fail(`source versions are missing: ${record.source_path}`);
  for (const version of versions) {
    if (!version.path || !sha256.test(String(version.sha256 || '')) || version.review_state !== 'required') {
      fail(`invalid source-version evidence: ${record.source_path}`);
    }
  }
}

const laneTotal = Object.values(queue.summary?.lane_counts || {}).reduce((sum, count) => sum + Number(count || 0), 0);
if (laneTotal !== records.length) fail('lane counts do not add up to the queue size');
const actualEncyclopedia = records.filter((record) => record.priority_lane === 'encyclopedia-last').length;
if (actualEncyclopedia !== Number(queue.summary?.lane_counts?.['encyclopedia-last'] || 0)) {
  fail('encyclopedia lane count does not match records');
}

if (failures.length) {
  console.error(JSON.stringify({ contract_version: 6, status: 'blocked', failures }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({
    contract_version: 6,
    status: 'passed',
    records: records.length,
    unique_paths: paths.size,
    source_versions: records.reduce((sum, record) => sum + record.source_versions_to_review.length, 0),
    encyclopedia_deferred: actualEncyclopedia,
  }, null, 2));
}
