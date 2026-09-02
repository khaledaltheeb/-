import fs from 'node:fs';

const roadmap = JSON.parse(fs.readFileSync('data/assessment-lab/roadmap-150.v1.json', 'utf8'));
const publication = JSON.parse(fs.readFileSync('data/assessment-lab/publication-state.v1.json', 'utf8'));
const monitors = JSON.parse(fs.readFileSync('data/assessment-lab/monitors.v1.json', 'utf8'));
const instruments = JSON.parse(fs.readFileSync('data/assessment-lab/instruments.v1.json', 'utf8'));
const fail = (message) => { console.error(`ASSESSMENT RELEASE SCOPE CONTRACT FAILED: ${message}`); process.exitCode = 1; };

const ACTIVE_RELEASE_SCOPE = 70;
const ACTIVE_RAWAFID_ORIGINALS = 60;
const ACTIVE_SOURCE_RIGHTS = 10;

// The 150-entry file is retained only as a deferred future backlog. It is not the active publication target.
if (roadmap.target !== 150) fail(`deferred roadmap must remain intact at 150 entries, found ${roadmap.target}`);
if (!Array.isArray(roadmap.entries) || roadmap.entries.length !== 150) fail(`deferred roadmap must retain 150 entries, found ${roadmap.entries?.length ?? 0}`);

const ids = new Set();
const slugs = new Set();
const titles = new Set();
const counts = new Map();
const portfolioBySlug = new Map();
for (const row of roadmap.entries ?? []) {
  if (!Number.isInteger(row.id) || row.id < 1 || row.id > 150) fail(`invalid deferred-roadmap id for ${row.slug ?? 'unknown'}`);
  if (ids.has(row.id)) fail(`duplicate deferred-roadmap id ${row.id}`); else ids.add(row.id);
  if (!row.slug || !/^[a-z0-9-]+$/.test(row.slug)) fail(`invalid slug at id ${row.id}`);
  if (slugs.has(row.slug)) fail(`duplicate slug ${row.slug}`); else slugs.add(row.slug);
  if (!row.title?.trim()) fail(`missing title for ${row.slug}`);
  if (titles.has(row.title.trim())) fail(`duplicate title ${row.title}`); else titles.add(row.title.trim());
  counts.set(row.portfolio, (counts.get(row.portfolio) ?? 0) + 1);
  portfolioBySlug.set(row.slug, row.portfolio);
}

for (let id = 1; id <= 150; id += 1) if (!ids.has(id)) fail(`missing deferred-roadmap id ${id}`);

const deferredExpected = {
  'rawafid-original': 90,
  'composite-pathway': 30,
  'clean-room-alternative': 20,
  'source-rights': 10,
};
for (const [portfolio, count] of Object.entries(deferredExpected)) {
  if (roadmap.portfolio_counts?.[portfolio] !== count) fail(`deferred ${portfolio} count must remain ${count}`);
  if (counts.get(portfolio) !== count) fail(`actual deferred ${portfolio} count must remain ${count}, found ${counts.get(portfolio) ?? 0}`);
}

for (const row of roadmap.entries.filter((row) => row.portfolio === 'clean-room-alternative')) {
  if (row.provenance !== 'independent-clean-room-required') fail(`clean-room provenance missing for deferred item ${row.slug}`);
  if (!row.construct || !row.reference_family) fail(`clean-room construct/reference family missing for deferred item ${row.slug}`);
}

if (roadmap.rules?.no_proprietary_copying !== true) fail('no_proprietary_copying rule must remain true');
if (roadmap.rules?.no_unvalidated_diagnostic_claims !== true) fail('no_unvalidated_diagnostic_claims rule must remain true');
if (roadmap.rules?.answers_persisted !== false) fail('answers_persisted must remain false');
if (roadmap.rules?.aggregate_score_default !== false) fail('aggregate_score_default must remain false');

// Active release scope is intentionally locked at 70 until an explicit future product decision changes it.
if (publication.published_routes !== ACTIVE_RELEASE_SCOPE) fail(`active publication scope must be exactly ${ACTIVE_RELEASE_SCOPE}, found ${publication.published_routes}`);
if (publication.published_rawafid_originals !== ACTIVE_RAWAFID_ORIGINALS) fail(`active Rawafid originals must be exactly ${ACTIVE_RAWAFID_ORIGINALS}`);
if (publication.published_source_rights !== ACTIVE_SOURCE_RIGHTS) fail(`active source-rights routes must be exactly ${ACTIVE_SOURCE_RIGHTS}`);
if ((publication.published_composites ?? 0) !== 0) fail('composite pathways are deferred and must not be published in the current 70-route phase');
if ((publication.published_clean_room_alternatives ?? 0) !== 0) fail('clean-room alternatives are deferred and must not be published in the current 70-route phase');
if (monitors.length !== ACTIVE_RAWAFID_ORIGINALS) fail(`monitor data must contain exactly ${ACTIVE_RAWAFID_ORIGINALS} active tools`);
if (instruments.length !== ACTIVE_SOURCE_RIGHTS) fail(`instrument data must contain exactly ${ACTIVE_SOURCE_RIGHTS} active source/rights routes`);
if (monitors.length + instruments.length !== ACTIVE_RELEASE_SCOPE) fail(`active route total must remain exactly ${ACTIVE_RELEASE_SCOPE}`);

const monitorSlugs = monitors.map((row) => row.slug);
const sourceSlugs = instruments.map((row) => row.slug);
if (new Set(monitorSlugs).size !== ACTIVE_RAWAFID_ORIGINALS) fail('active Rawafid monitor slugs must be unique');
if (new Set(sourceSlugs).size !== ACTIVE_SOURCE_RIGHTS) fail('active source-rights slugs must be unique');
if (monitorSlugs.some((slug) => sourceSlugs.includes(slug))) fail('a slug cannot be both an active Rawafid tool and an active source/rights route');
if (JSON.stringify([...publication.rawafid_original_slugs].sort()) !== JSON.stringify([...monitorSlugs].sort())) fail('publication Rawafid slug snapshot does not match monitors.v1.json');
if (JSON.stringify([...publication.source_rights_slugs].sort()) !== JSON.stringify([...sourceSlugs].sort())) fail('publication source-rights slug snapshot does not match instruments.v1.json');
for (const slug of monitorSlugs) if (portfolioBySlug.get(slug) !== 'rawafid-original') fail(`active monitor ${slug} is not classified as rawafid-original in the deferred roadmap`);
for (const slug of sourceSlugs) if (portfolioBySlug.get(slug) !== 'source-rights') fail(`active source route ${slug} is not classified as source-rights in the deferred roadmap`);

if (!process.exitCode) console.log('Assessment release scope contract passed: current publication is locked to exactly 70 routes = 60 Rawafid originals + 10 source/rights pages; the 150-entry roadmap is retained only as deferred future backlog.');
