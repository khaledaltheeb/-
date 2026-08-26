import fs from 'node:fs';

const roadmap = JSON.parse(fs.readFileSync('data/assessment-lab/roadmap-150.v1.json', 'utf8'));
const fail = (message) => { console.error(`ASSESSMENT ROADMAP CONTRACT FAILED: ${message}`); process.exitCode = 1; };

if (roadmap.target !== 150) fail(`target must remain 150, found ${roadmap.target}`);
if (!Array.isArray(roadmap.entries) || roadmap.entries.length !== 150) fail(`expected 150 roadmap entries, found ${roadmap.entries?.length ?? 0}`);

const ids = new Set();
const slugs = new Set();
const titles = new Set();
const counts = new Map();
for (const row of roadmap.entries ?? []) {
  if (!Number.isInteger(row.id) || row.id < 1 || row.id > 150) fail(`invalid id for ${row.slug ?? 'unknown'}`);
  if (ids.has(row.id)) fail(`duplicate id ${row.id}`); else ids.add(row.id);
  if (!row.slug || !/^[a-z0-9-]+$/.test(row.slug)) fail(`invalid slug at id ${row.id}`);
  if (slugs.has(row.slug)) fail(`duplicate slug ${row.slug}`); else slugs.add(row.slug);
  if (!row.title?.trim()) fail(`missing title for ${row.slug}`);
  if (titles.has(row.title.trim())) fail(`duplicate title ${row.title}`); else titles.add(row.title.trim());
  counts.set(row.portfolio, (counts.get(row.portfolio) ?? 0) + 1);
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

const existingLocal = roadmap.entries.filter((row) => row.portfolio === 'rawafid-original' && row.status === 'published-v2');
if (existingLocal.length !== 36) fail(`expected 36 published-v2 local tools, found ${existingLocal.length}`);
const existingSources = roadmap.entries.filter((row) => row.portfolio === 'source-rights' && row.status === 'published-source');
if (existingSources.length !== 4) fail(`expected 4 currently published source routes, found ${existingSources.length}`);

for (const row of roadmap.entries.filter((row) => row.portfolio === 'clean-room-alternative')) {
  if (row.provenance !== 'independent-clean-room-required') fail(`clean-room provenance missing for ${row.slug}`);
  if (!row.construct || !row.reference_family) fail(`clean-room construct/reference family missing for ${row.slug}`);
}

if (roadmap.rules?.no_proprietary_copying !== true) fail('no_proprietary_copying rule must remain true');
if (roadmap.rules?.no_unvalidated_diagnostic_claims !== true) fail('no_unvalidated_diagnostic_claims rule must remain true');
if (roadmap.rules?.answers_persisted !== false) fail('answers_persisted must remain false');
if (roadmap.rules?.aggregate_score_default !== false) fail('aggregate_score_default must remain false');

if (!process.exitCode) console.log('Assessment roadmap contract passed: 150 unique routes = 90 Rawafid originals + 30 composites + 20 clean-room alternatives + 10 source/rights routes.');
