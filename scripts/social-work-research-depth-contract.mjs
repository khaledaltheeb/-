import fs from 'node:fs';

const route = fs.readFileSync('app/evidence-guides/social-work/[[...slug]]/route.ts', 'utf8');
const layer = fs.readFileSync('lib/social-work-research-depth.ts', 'utf8');

const fail = (message) => {
  console.error(`SOCIAL WORK RESEARCH DEPTH CONTRACT FAILED: ${message}`);
  process.exit(1);
};

if (!route.includes('enrichSocialWorkResearchDepth')) fail('route does not invoke the research-depth layer');
if (!route.includes('research-depth-${SOCIAL_WORK_RESEARCH_RELEASE}')) fail('response provenance header is missing the research release');

const requiredRoutes = [
  'child-voice-family-decisions',
  'participation-and-voice',
  'supported-decision-making',
  'older-adults-family-support',
  'caregiver-role-burden',
  'service-coordination',
  'referral-with-continuity',
  'failed-referral-recovery',
  'community-resource-map',
  'poverty-structural-barriers',
  'financial-crisis-family-plan',
  'institutional-advocacy',
  'help-plan-quality-audit',
  'family-feedback-service-quality',
  'transition-to-adulthood',
];

for (const slug of requiredRoutes) {
  if (!layer.includes(`'${slug}': {`)) fail(`missing high-priority research profile: ${slug}`);
}

const requiredEvidenceFingerprints = [
  '38971702',
  '10.1016/j.childyouth.2026.108950',
  '10.1016/j.childyouth.2024.107588',
  '38433012',
  '39711033',
  '40936314',
  'PMC12238300',
  '9789240103726',
  '36751899',
  '67293',
  '9789240088320',
  'growing-rights',
];
for (const fingerprint of requiredEvidenceFingerprints) {
  if (!layer.includes(fingerprint)) fail(`missing evidence source fingerprint: ${fingerprint}`);
}

for (const phrase of ['تصميم الدليل:', 'حد الاستنتاج:', 'حدود الاستخدام:', 'مؤشرات متابعة قابلة للتدقيق']) {
  if (!layer.includes(phrase)) fail(`missing evidence-governance element: ${phrase}`);
}

const sourceCards = [...layer.matchAll(/^  [a-zA-Z][a-zA-Z0-9]+: \{/gm)].length;
if (sourceCards < 12) fail(`expected at least 12 direct research sources; found ${sourceCards}`);

console.log(`SOCIAL WORK RESEARCH DEPTH CONTRACT OK: ${requiredRoutes.length} high-priority pages, ${sourceCards}+ source records, study-design and inference-limit governance present.`);
