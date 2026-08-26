import fs from 'node:fs';

const roadmap = JSON.parse(fs.readFileSync('data/assessment-lab/roadmap-150.v1.json', 'utf8'));
const publication = JSON.parse(fs.readFileSync('data/assessment-lab/publication-state.v1.json', 'utf8'));
const monitors = JSON.parse(fs.readFileSync('data/assessment-lab/monitors.v1.json', 'utf8'));
const instruments = JSON.parse(fs.readFileSync('data/assessment-lab/instruments.v1.json', 'utf8'));
const fail = (message) => { console.error(`ASSESSMENT ROADMAP CONTRACT FAILED: ${message}`); process.exitCode = 1; };

if (roadmap.target !== 150) fail(`target must remain 150, found ${roadmap.target}`);
if (!Array.isArray(roadmap.entries) || roadmap.entries.length !== 150) fail(`expected 150 roadmap entries, found ${roadmap.entries?.length ?? 0}`);

const ids = new Set();
const slugs = new Set();
const titles = new Set();
const counts = new Map();
const portfolioBySlug = new Map();
for (const row of roadmap.entries ?? []) {
  if (!Number.isInteger(row.id) || row.id < 1 || row.id > 150) fail(`invalid id for ${row.slug ?? 'unknown'}`);
  if (ids.has(row.id)) fail(`duplicate id ${row.id}`); else ids.add(row.id);
  if (!row.slug || !/^[a-z0-9-]+$/.test(row.slug)) fail(`invalid slug at id ${row.id}`);
  if (slugs.has(row.slug)) fail(`duplicate slug ${row.slug}`); else slugs.add(row.slug);
  if (!row.title?.trim()) fail(`missing title for ${row.slug}`);
  if (titles.has(row.title.trim())) fail(`duplicate title ${row.title}`); else titles.add(row.title.trim());
  counts.set(row.portfolio, (counts.get(row.portfolio) ?? 0) + 1);
  portfolioBySlug.set(row.slug, row.portfolio);
}

for (let id = 1; id <= 150; id += 1) if (!ids.has(id)) fail(`missing id ${id}`);

const expected = {
  'rawafid-original': 90,
  'composite-pathway': 30,
  'clean-room-alternative': 20,
  'source-rights': 10,
};
for (const [portfolio, count] of Object.entries(expected)) {
  if (roadmap.portfolio_counts?.[portfolio] !== count) fail(`declared ${portfolio} count must be ${count}`);
  if (counts.get(portfolio) !== count) fail(`actual ${portfolio} count must be ${count}, found ${counts.get(portfolio) ?? 0}`);
}

for (const row of roadmap.entries.filter((row) => row.portfolio === 'clean-room-alternative')) {
  if (row.provenance !== 'independent-clean-room-required') fail(`clean-room provenance missing for ${row.slug}`);
  if (!row.construct || !row.reference_family) fail(`clean-room construct/reference family missing for ${row.slug}`);
}

if (roadmap.rules?.no_proprietary_copying !== true) fail('no_proprietary_copying rule must remain true');
if (roadmap.rules?.no_unvalidated_diagnostic_claims !== true) fail('no_unvalidated_diagnostic_claims rule must remain true');
if (roadmap.rules?.answers_persisted !== false) fail('answers_persisted must remain false');
if (roadmap.rules?.aggregate_score_default !== false) fail('aggregate_score_default must remain false');

if (publication.published_routes !== 70) fail(`publication snapshot must declare 70 routes, found ${publication.published_routes}`);
if (publication.published_rawafid_originals !== 60) fail(`publication snapshot must declare 60 Rawafid originals`);
if (publication.published_source_rights !== 10) fail(`publication snapshot must declare 10 source-rights pages`);
if (monitors.length !== publication.published_rawafid_originals) fail(`monitor data/publication snapshot mismatch`);
if (instruments.length !== publication.published_source_rights) fail(`instrument data/publication snapshot mismatch`);
if (monitors.length + instruments.length !== publication.published_routes) fail(`published route total mismatch`);

const monitorSlugs = monitors.map((row) => row.slug);
const sourceSlugs = instruments.map((row) => row.slug);
if (JSON.stringify([...publication.rawafid_original_slugs].sort()) !== JSON.stringify([...monitorSlugs].sort())) fail('publication Rawafid slug snapshot does not match monitors.v1.json');
if (JSON.stringify([...publication.source_rights_slugs].sort()) !== JSON.stringify([...sourceSlugs].sort())) fail('publication source-rights slug snapshot does not match instruments.v1.json');
for (const slug of monitorSlugs) if (portfolioBySlug.get(slug) !== 'rawafid-original') fail(`published monitor ${slug} is not classified as rawafid-original in roadmap`);
for (const slug of sourceSlugs) if (portfolioBySlug.get(slug) !== 'source-rights') fail(`published source route ${slug} is not classified as source-rights in roadmap`);

if (!process.exitCode) console.log('Assessment roadmap contract passed: target portfolio remains 150 (90/30/20/10); authoritative publication state is 70 routes = 60 Rawafid originals + 10 source/rights pages.');
