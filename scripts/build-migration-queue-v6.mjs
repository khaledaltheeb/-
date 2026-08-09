#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const EDITORIAL_LEAK_PATTERNS = [
  /ملاحظة\s+(?:للمحرر|تحريرية)/giu,
  /يجب\s+(?:إضافة|توسيع|مراجعة)\s+(?:هذا|هذه|المحتوى|القسم)/giu,
  /(?:TODO|FIXME|placeholder|lorem ipsum)/giu,
  /(?:الثيم|القالب)\s+(?:الخاص|الحالي|الجديد|المستخدم)/giu,
  /(?:خطتنا|خططنا)\s+(?:الخاصة|التحريرية|للموقع)/giu,
];
const WARNING_PATTERNS = [/تنبيه(?:ات)?/gu, /تحذير(?:ات)?/gu, /طوارئ/gu, /خطر/gu];
const INTERACTIVE_PREFIXES = [
  '/assessment-lab/',
  '/assessments/',
  '/cognitive-lab/',
  '/cognitive-tests/',
  '/guided-assessment/',
  '/provider-assessment-demo/',
];

function parseArgs(argv) {
  const args = { inventory: '', taxonomy: '', legacyRoot: '', output: '' };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--inventory') args.inventory = argv[++index] || '';
    else if (value === '--taxonomy') args.taxonomy = argv[++index] || '';
    else if (value === '--legacy-root') args.legacyRoot = argv[++index] || '';
    else if (value === '--output') args.output = argv[++index] || '';
    else throw new Error(`Unknown argument: ${value}`);
  }
  for (const [key, value] of Object.entries(args)) {
    if (!value) throw new Error(`Missing --${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`);
  }
  return args;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function normalizeRoute(value) {
  const route = String(value || '').trim();
  if (!route) return '/';
  const withLeading = route.startsWith('/') ? route : `/${route}`;
  if (path.posix.extname(withLeading)) return withLeading;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

function routeMatches(route, patterns) {
  return patterns.some((prefix) => route === prefix || route.startsWith(prefix));
}

function countMatches(text, patterns) {
  return patterns.reduce((total, pattern) => total + [...String(text || '').matchAll(pattern)].length, 0);
}

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function safeLegacyFile(root, relativePath) {
  const resolvedRoot = path.resolve(root);
  const candidate = path.resolve(resolvedRoot, relativePath);
  if (candidate !== resolvedRoot && !candidate.startsWith(`${resolvedRoot}${path.sep}`)) return null;
  return fs.existsSync(candidate) && fs.statSync(candidate).isFile() ? candidate : null;
}

function reviewedVersions(record, legacyRoot) {
  const versions = [];
  const currentPath = record.source_html || record.source_file;
  const currentFile = currentPath ? safeLegacyFile(legacyRoot, currentPath) : null;
  if (currentPath && currentFile) {
    versions.push({
      kind: record.kind === 'resource' ? 'published-resource' : 'published-html',
      path: currentPath,
      sha256: record.sha256 || sha256File(currentFile),
      review_state: 'required',
    });
  }
  for (const source of record.structured_sources || []) {
    const file = safeLegacyFile(legacyRoot, source);
    versions.push({
      kind: 'structured-source-variant',
      path: source,
      sha256: file ? sha256File(file) : null,
      review_state: 'required',
    });
  }
  const unique = new Map();
  for (const version of versions) unique.set(`${version.kind}:${version.path}`, version);
  return [...unique.values()];
}

function suggestionFor(route, taxonomy) {
  const candidates = (taxonomy.prefix_suggestions || [])
    .filter((item) => routeMatches(route, [item.prefix]))
    .sort((a, b) => b.prefix.length - a.prefix.length);
  const first = candidates[0];
  return first ? {
    sector_slug: first.sector_slug ?? null,
    category_slug: first.category_slug ?? null,
    suggestion_only: true,
    state: first.sector_slug && first.category_slug ? 'requires-human-confirmation' : 'taxonomy-gap',
  } : {
    sector_slug: null,
    category_slug: null,
    suggestion_only: true,
    state: 'requires-human-classification',
  };
}

function laneFor(route, taxonomy) {
  const priorities = taxonomy.migration_priority || {};
  if (routeMatches(route, priorities.encyclopedia_last || [])) {
    return { key: 'encyclopedia-last', order: 90, deferred: true };
  }
  if (routeMatches(route, priorities.scientific_and_strategic_first || [])) {
    return { key: 'scientific-strategic', order: 10, deferred: false };
  }
  if (routeMatches(route, priorities.core_sectors_next || [])) {
    return { key: 'core-sectors', order: 20, deferred: false };
  }
  if (routeMatches(route, ['/quick-info/', '/content/quick-info-editorial/'])) {
    return { key: 'quick-information', order: 30, deferred: false };
  }
  if (INTERACTIVE_PREFIXES.some((prefix) => routeMatches(route, [prefix])) || route.includes('/tools/')) {
    return { key: 'interactive-quality', order: 40, deferred: false };
  }
  return { key: 'general-editorial', order: 50, deferred: false };
}

function recordScore(item) {
  const shortfall = Math.max(0, item.target_minimum_words - item.legacy_metrics.word_count);
  const sourceDepth = item.source_versions_to_review.length * 80;
  const referenceDepth = item.legacy_metrics.external_references * 12;
  const weakBoost = Math.min(shortfall, 2500);
  const strategicBoost = item.priority_lane === 'scientific-strategic' ? 3000 : 0;
  return strategicBoost + weakBoost + sourceDepth + referenceDepth;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const inventory = readJson(args.inventory);
  const taxonomy = readJson(args.taxonomy);
  const records = Array.isArray(inventory.records) ? inventory.records : [];
  if (records.length < 800) throw new Error(`Legacy inventory unexpectedly small: ${records.length}`);

  const queue = records.map((record) => {
    const route = normalizeRoute(record.path || new URL(record.url).pathname);
    const lane = laneFor(route, taxonomy);
    const interactive = lane.key === 'interactive-quality' || record.kind === 'resource';
    const bodyText = String(record.body_text || '');
    const item = {
      source_url: record.url,
      source_path: route,
      source_kind: record.kind,
      source_sha256: record.sha256 || null,
      priority_lane: lane.key,
      priority_order: lane.order,
      encyclopedia_deferred: lane.deferred,
      migration_state: lane.deferred ? 'deferred-by-owner-order' : 'queued-for-analysis',
      target_minimum_words: interactive ? 0 : 2500,
      expansion_rule: interactive
        ? 'Text expansion is optional; correctness, capacity, accessibility and performance contracts are mandatory.'
        : 'At least 2500 useful Arabic words after evidence-led rewriting; filler and copied boilerplate do not count.',
      disclaimer_policy: {
        inline_warning_blocks_allowed: false,
        route: '/disclaimer',
        label: 'إخلاء المسؤولية والتنبيهات',
      },
      source_versions_to_review: reviewedVersions(record, args.legacyRoot),
      page_understanding_gate: {
        content_read_required: true,
        all_discovered_versions_read_required: true,
        purpose_and_audience_required: true,
        page_mechanism_required: true,
        rewrite_from_evidence_required: true,
      },
      taxonomy: suggestionFor(route, taxonomy),
      legacy_metrics: {
        word_count: Number(record.word_count || 0),
        body_blocks: Array.isArray(record.body_json?.blocks) ? record.body_json.blocks.length : 0,
        external_references: Array.isArray(record.references) ? record.references.length : 0,
        internal_links: Array.isArray(record.internal_links) ? record.internal_links.length : 0,
        editorial_leak_occurrences: countMatches(bodyText, EDITORIAL_LEAK_PATTERNS),
        warning_language_occurrences: countMatches(bodyText, WARNING_PATTERNS),
      },
    };
    return { ...item, priority_score: recordScore(item) };
  }).sort((a, b) => (
    a.priority_order - b.priority_order
    || b.priority_score - a.priority_score
    || a.source_path.localeCompare(b.source_path, 'ar')
  ));

  const laneCounts = {};
  for (const item of queue) laneCounts[item.priority_lane] = (laneCounts[item.priority_lane] || 0) + 1;
  const summary = {
    contract_version: 6,
    generated_at: new Date().toISOString(),
    source_repo: inventory.summary?.source_repo || 'khaledaltheeb/healthrenewal.org',
    record_count: queue.length,
    target_minimum_editorial_words: 2500,
    encyclopedia_last_enforced: true,
    lane_counts: laneCounts,
    records_below_2500: queue.filter((item) => item.target_minimum_words === 2500 && item.legacy_metrics.word_count < 2500).length,
    records_with_multiple_source_versions: queue.filter((item) => item.source_versions_to_review.length > 1).length,
    records_with_editorial_leakage: queue.filter((item) => item.legacy_metrics.editorial_leak_occurrences > 0).length,
    records_with_warning_language: queue.filter((item) => item.legacy_metrics.warning_language_occurrences > 0).length,
    taxonomy_gaps: queue.filter((item) => item.taxonomy.state === 'taxonomy-gap').length,
    taxonomy_unclassified: queue.filter((item) => item.taxonomy.state === 'requires-human-classification').length,
  };

  const output = {
    summary,
    contract: {
      content_only: true,
      copy_and_paste_forbidden: true,
      source_versions_must_be_reviewed: true,
      page_mechanism_must_be_understood: true,
      scientific_and_strategic_pages_prioritized: true,
      encyclopedia_migrated_last: true,
      exact_taxonomy_required_before_release: true,
      inline_warnings_forbidden: true,
      central_disclaimer_link_required: true,
      editorial_minimum_useful_words: 2500,
    },
    records: queue,
  };
  fs.mkdirSync(path.dirname(args.output), { recursive: true });
  if (args.output.endsWith('.json.gz')) {
    fs.writeFileSync(args.output, zlib.gzipSync(JSON.stringify(output), { level: 9 }));
    const summaryPath = args.output.replace(/\.json\.gz$/, '.summary.json');
    fs.writeFileSync(summaryPath, `${JSON.stringify({ summary, contract: output.contract }, null, 2)}\n`, 'utf8');
  } else {
    fs.writeFileSync(args.output, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  }
  console.log(JSON.stringify(summary, null, 2));
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
