#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BATCH_DIR = path.join(ROOT, 'data', 'encyclopedia', 'batches');
const REVIEW_DIR = path.join(ROOT, 'data', 'encyclopedia', 'generated', 'review-drafts');
const ADOPTION_PATH = path.join(ROOT, 'data', 'encyclopedia', 'canonical-adoptions-v1.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function files(dir) {
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort().map((name) => path.join(dir, name)) : [];
}

function canonicalFor(slug) {
  return `/encyclopedia/${slug}/`;
}

function psychOwners() {
  const owners = new Map();
  for (const file of files(BATCH_DIR)) {
    const payload = readJson(file);
    for (const row of Array.isArray(payload.records) ? payload.records : []) {
      if (!row || typeof row !== 'object' || !row.slug) continue;
      const slug = String(row.slug).trim();
      const canonical = String(row.canonical_url || '').trim();
      if (canonical !== canonicalFor(slug)) throw new Error(`${path.relative(ROOT, file)}: ${slug} has noncanonical encyclopedia URL ${canonical}`);
      const prior = owners.get(slug);
      if (prior) throw new Error(`Duplicate canonical ownership inside encyclopedia batches: ${slug} in ${prior} and ${path.relative(ROOT, file)}`);
      owners.set(slug, path.relative(ROOT, file));
    }
  }
  return owners;
}

function reviewOwners() {
  const owners = new Map();
  for (const file of files(REVIEW_DIR)) {
    const payload = readJson(file);
    const records = Array.isArray(payload.records) ? payload.records : [];
    if (records.length !== 1 || !records[0]?.slug) throw new Error(`${path.relative(ROOT, file)} must contain exactly one review record`);
    const row = records[0];
    const slug = String(row.slug).trim();
    if (String(row.canonical_url || '').trim() !== canonicalFor(slug)) throw new Error(`${path.relative(ROOT, file)}: canonical mismatch for ${slug}`);
    if (row.status !== 'scientific_review' || row.robots_index !== false || row.published_at !== null) throw new Error(`${slug}: review record must remain scientific_review/noindex/unpublished`);
    const prior = owners.get(slug);
    if (prior) throw new Error(`Duplicate specialty review canonical: ${slug}`);
    owners.set(slug, path.relative(ROOT, file));
  }
  return owners;
}

function adoptions(psych) {
  const payload = readJson(ADOPTION_PATH);
  if (payload.version !== 1 || !Array.isArray(payload.adoptions)) throw new Error('Invalid canonical adoption manifest');
  const adopted = new Map();
  for (const row of payload.adoptions) {
    const slug = String(row?.slug || '').trim();
    if (!slug) throw new Error('Canonical adoption missing slug');
    if (adopted.has(slug)) throw new Error(`Duplicate canonical adoption: ${slug}`);
    if (row.import_as_new_record !== false || row.decision !== 'merge-into-existing-canonical') throw new Error(`${slug}: adoption must block new-record import`);
    if (row.canonical_url !== canonicalFor(slug)) throw new Error(`${slug}: adoption canonical mismatch`);
    const owner = psych.get(slug);
    if (!owner) throw new Error(`${slug}: adopted canonical owner does not exist in encyclopedia batches`);
    if (owner !== row.owner_source) throw new Error(`${slug}: adoption owner_source mismatch; expected ${owner}, found ${row.owner_source}`);
    const enrichment = path.join(ROOT, row.specialty_enrichment_source || '');
    if (!fs.existsSync(enrichment)) throw new Error(`${slug}: specialty enrichment source is missing`);
    adopted.set(slug, row.owner_source);
  }
  return adopted;
}

function main() {
  const psych = psychOwners();
  const review = reviewOwners();
  const adopted = adoptions(psych);
  const collisions = [...review.keys()].filter((slug) => psych.has(slug));
  if (collisions.length) {
    throw new Error(`Unresolved cross-domain encyclopedia canonical collision(s): ${collisions.join(', ')}. Move specialty material to an adoption/enrichment record instead of creating a second page.`);
  }
  for (const slug of adopted.keys()) {
    if (review.has(slug)) throw new Error(`${slug}: adopted canonical must not remain in new-record review payloads`);
  }
  const result = {
    status: 'passed',
    psychological_canonicals: psych.size,
    specialty_new_review_canonicals: review.size,
    adopted_shared_canonicals: adopted.size,
    unresolved_collisions: 0,
    new_review_slugs: [...review.keys()].sort(),
    adopted_slugs: [...adopted.keys()].sort(),
  };
  console.log(JSON.stringify(result, null, 2));
}

try {
  main();
} catch (error) {
  console.error(`Encyclopedia canonical ownership validation failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
