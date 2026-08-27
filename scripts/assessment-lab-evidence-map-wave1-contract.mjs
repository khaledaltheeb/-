import fs from 'node:fs';

const standard = JSON.parse(fs.readFileSync('data/assessment-lab/evidence-map-standard.v1.json', 'utf8'));
const map = JSON.parse(fs.readFileSync('data/assessment-lab/evidence-map.wave1.v1.json', 'utf8'));
const dossiers = JSON.parse(fs.readFileSync('data/assessment-lab/scientific-profiles.wave1-v2.v1.json', 'utf8'));
const monitors = JSON.parse(fs.readFileSync('data/assessment-lab/monitors.v1.json', 'utf8'));
const registry = fs.readFileSync('lib/assessment-lab/evidence-map.ts', 'utf8');
const detail = fs.readFileSync('app/assessment-lab/[slug]/page.tsx', 'utf8');
const fail = (message) => { console.error(`ASSESSMENT EVIDENCE MAP WAVE1 FAILED: ${message}`); process.exitCode = 1; };

if (standard.status !== 'mandatory') fail('evidence map standard must remain mandatory');
if (standard.scope?.tool_count !== 12 || standard.scope?.domain_count !== 48) fail('wave1 scope must remain 12 tools / 48 domains');
for (const rule of ['every_published_domain_requires_evidence','generic_search_url_forbidden','orphan_reference_forbidden','construct_support_is_not_instrument_validation','content_validity_claim_requires_empirical_content_validity_work','psychometric_validity_claim_requires_empirical_measurement_studies','causal_language_requires_causal_evidence','limitations_required_per_domain']) {
  if (standard.publication_rules?.[rule] !== true) fail(`mandatory evidence rule disabled: ${rule}`);
}
if (!Array.isArray(standard.methodology_sources) || standard.methodology_sources.length < 3) fail('evidence mapping requires methodology sources');
if (!standard.methodology_sources.some((source) => source.url?.includes('cosmin.nl'))) fail('COSMIN methodology grounding missing');
if (!standard.methodology_sources.some((source) => source.url?.includes('fda.gov'))) fail('FDA COA methodology grounding missing');
if (!standard.methodology_sources.some((source) => source.url?.includes('healthmeasures.net'))) fail('PROMIS/HealthMeasures methodology grounding missing');

const expected = ['decision-fatigue','procrastination-cycle','perfectionism-pressure','study-overload','work-boundaries','return-to-work-readiness','digital-overload','social-media-impact','doomscrolling-pattern','gaming-balance','screen-sleep-interference','notification-stress'];
if (!Array.isArray(map.tools) || map.tools.length !== expected.length) fail(`expected ${expected.length} evidence-mapped tools`);
if (!map.validation_boundary?.includes('لا تثبت صدق أو ثبات') || !map.validation_boundary?.includes('الدراسات السيكومترية')) fail('validation boundary must explicitly separate construct evidence from instrument validation');
const dossierMap = new Map(dossiers.profiles.map((profile) => [profile.slug, profile]));
const toolMap = new Map(map.tools.map((tool) => [tool.slug, tool]));
let domainCount = 0;
for (const slug of expected) {
  const tool = toolMap.get(slug);
  const dossier = dossierMap.get(slug);
  const monitor = monitors.find((row) => row.slug === slug);
  if (!tool || !dossier || !monitor) { fail(`missing evidence map/dossier/monitor for ${slug}`); continue; }
  if (dossier.validation_stage !== 'item-development') fail(`${slug} evidence map cannot advance validation stage`);
  if (!Array.isArray(tool.domains) || tool.domains.length !== monitor.axes.length) fail(`${slug} evidence map must cover all ${monitor.axes.length} published domains`);
  const mappedDomains = tool.domains.map((domain) => domain.domain);
  if (JSON.stringify(mappedDomains) !== JSON.stringify(monitor.axes)) fail(`${slug} evidence domains must exactly match published axes and order`);
  domainCount += tool.domains.length;
  const referenceIds = new Set();
  const referenceUrls = new Set();
  for (const reference of tool.references ?? []) {
    if (!reference.id?.trim() || referenceIds.has(reference.id)) fail(`${slug} contains duplicate or missing reference id`);
    referenceIds.add(reference.id);
    if (!reference.title?.trim() || !reference.url?.startsWith('https://')) fail(`${slug}/${reference.id} malformed reference`);
    if (reference.url.includes('?term=')) fail(`${slug}/${reference.id} uses a generic search URL`);
    if (referenceUrls.has(reference.url)) fail(`${slug} duplicates reference URL ${reference.url}`);
    referenceUrls.add(reference.url);
    if (!standard.allowed_evidence_types.includes(reference.evidence_type)) fail(`${slug}/${reference.id} uses unsupported evidence type ${reference.evidence_type}`);
    if (!reference.supports?.trim() || reference.supports.trim().length < 25) fail(`${slug}/${reference.id} support statement too weak`);
    if (!reference.limitations?.trim() || reference.limitations.trim().length < 25) fail(`${slug}/${reference.id} limitations too weak`);
    if (!(dossier.scientific_references ?? []).some((source) => source.url === reference.url)) fail(`${slug}/${reference.id} evidence URL is not traceable to its scientific dossier`);
  }
  const usedReferenceIds = new Set();
  for (const domain of tool.domains ?? []) {
    if (!standard.allowed_evidence_relations.includes(domain.evidence_relation)) fail(`${slug}/${domain.domain} invalid evidence relation`);
    if (!domain.claim?.trim() || domain.claim.trim().length < 45) fail(`${slug}/${domain.domain} claim too weak`);
    if (!domain.limitations?.trim() || domain.limitations.trim().length < 35) fail(`${slug}/${domain.domain} limitations too weak`);
    if (!Array.isArray(domain.reference_ids) || domain.reference_ids.length < 1) fail(`${slug}/${domain.domain} has no evidence`);
    for (const id of domain.reference_ids ?? []) {
      if (!referenceIds.has(id)) fail(`${slug}/${domain.domain} references unknown source ${id}`);
      usedReferenceIds.add(id);
    }
    if (/يثبت (صدق|ثبات|صلاحية)|مقنن|validated/i.test(domain.claim)) fail(`${slug}/${domain.domain} makes a prohibited instrument-validation claim`);
  }
  for (const id of referenceIds) if (!usedReferenceIds.has(id)) fail(`${slug} has orphan evidence reference ${id}`);
}
if (domainCount !== 48) fail(`expected 48 mapped domains, found ${domainCount}`);
for (const tool of map.tools ?? []) if (!expected.includes(tool.slug)) fail(`unexpected evidence-map tool ${tool.slug}`);

for (const token of ['getAssessmentEvidenceMap','getAssessmentEvidenceReference','getAssessmentEvidenceRelationLabel','getAssessmentEvidenceTypeLabel','assessmentEvidenceValidationBoundary']) {
  if (!registry.includes(token)) fail(`evidence registry missing ${token}`);
}
for (const token of ['getAssessmentEvidenceMap','خريطة الأدلة · Claim-to-evidence','ما الدليل الذي يبرر كل محور؟','حدود الاستدلال','صلة الدليل بالمحور']) {
  if (!detail.includes(token)) fail(`published assessment detail page missing evidence-map UI token: ${token}`);
}

if (!process.exitCode) console.log('Assessment evidence map wave1 passed: 12 tools / 48 domains are claim-mapped to dossier-traceable evidence with explicit relation type and limitations; no evidence map advances psychometric validation status.');
