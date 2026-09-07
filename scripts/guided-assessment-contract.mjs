import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => { console.error(`GUIDED ASSESSMENT CONTRACT FAILED: ${message}`); process.exitCode = 1; };

const topics = JSON.parse(read('data/guided-assessment/topics.v1.json'));
const guidanceFile = JSON.parse(read('data/guided-assessment/topic-guidance.v1.json'));
const catalog = read('lib/guided-assessment/catalog.ts');
const hub = read('app/guided-assessment/page.tsx');
const detail = read('app/guided-assessment/[slug]/page.tsx');
const client = read('components/guided-assessment-checklist.tsx');

if (!Array.isArray(topics) || topics.length !== 50) fail(`expected 50 consolidated topics; found ${topics.length}`);
const keys = new Set(topics.map((topic) => topic.key));
if (keys.size !== topics.length) fail('topic keys must be unique');
for (const topic of topics) {
  if (!topic.key || !topic.label || !topic.legacyLabel || !topic.group) fail(`incomplete topic record: ${JSON.stringify(topic)}`);
}

if (guidanceFile.schema_version !== 1) fail(`unexpected topic-guidance schema version: ${guidanceFile.schema_version}`);
if (!Array.isArray(guidanceFile.profiles) || guidanceFile.profiles.length !== 50) fail(`expected 50 topic guidance profiles; found ${guidanceFile.profiles?.length ?? 0}`);
const guidanceKeys = new Set(guidanceFile.profiles.map((profile) => profile.key));
if (guidanceKeys.size !== guidanceFile.profiles.length) fail('topic guidance keys must be unique');
const guidanceByKey = new Map(guidanceFile.profiles.map((profile) => [profile.key, profile]));
for (const topic of topics) {
  if (!guidanceKeys.has(topic.key)) fail(`missing topic guidance for ${topic.key}`);
}
for (const profile of guidanceFile.profiles) {
  if (!keys.has(profile.key)) fail(`orphan topic guidance profile: ${profile.key}`);
  if (!Array.isArray(profile.focusPrompts) || profile.focusPrompts.length < 4) fail(`${profile.key} must have at least four topic-specific focus prompts`);
  if (profile.focusPrompts.some((prompt) => typeof prompt !== 'string' || prompt.trim().length < 20)) fail(`${profile.key} contains a weak/empty focus prompt`);
  if (typeof profile.boundary !== 'string' || profile.boundary.trim().length < 35) fail(`${profile.key} must include a substantive interpretation boundary`);
  if (!Array.isArray(profile.referenceIds) || profile.referenceIds.length < 1) fail(`${profile.key} must cite at least one reference id`);
  if (profile.safety != null && (typeof profile.safety !== 'string' || profile.safety.trim().length < 35)) fail(`${profile.key} safety guidance is too short`);
}

const safetyCriticalTopics = [
  'anxiety',
  'depression',
  'panic-attacks',
  'psychological-trauma',
  'ptsd',
  'grief-loss',
  'anger',
  'harmful-relationships',
  'psychological-boundaries',
  'memory',
  'sleep',
  'emotional-eating',
  'body-image',
  'addiction',
  'bullying',
  'family-violence',
  'positive-parenting',
  'family-therapy',
];
for (const key of safetyCriticalTopics) {
  const profile = guidanceByKey.get(key);
  if (!profile?.safety || profile.safety.trim().length < 35) fail(`${key} must include a topic-specific safety branch`);
}

const usedReferenceIds = new Set(guidanceFile.profiles.flatMap((profile) => profile.referenceIds));
for (const id of usedReferenceIds) {
  if (!catalog.includes(`id: '${id}'`) && !catalog.includes(`${id}: {`)) fail(`reference id ${id} is used by guidance but missing from the catalog`);
}

if (!catalog.includes("import topicGuidanceData from '@/data/guided-assessment/topic-guidance.v1.json'")) fail('catalog must load the topic-specific guidance registry');
if (!catalog.includes('getTopicGuidance')) fail('catalog must expose topic guidance lookup');
if (!catalog.includes('getTopicReferences')) fail('catalog must expose topic-specific authoritative references');
if (!catalog.includes('guidedAssessmentTopics.length * 2')) fail('catalog must derive the 100 legacy aliases from the 50-topic source');
if (!catalog.includes("legacyNumber % 2 === 1 ? 'adult' : 'child'")) fail('legacy odd/even audience parity mapping is missing');

if (!detail.includes('index: false')) fail('historical detail aliases must remain noindex');
if (!detail.includes("path: '/guided-assessment'")) fail('historical aliases must canonicalize to the consolidated hub');
if (!hub.includes('index: true')) fail('consolidated hub must be the indexable canonical surface');
if (!hub.includes('100</strong> رابط تاريخي محفوظ')) fail('hub must disclose the 100-route consolidation');

for (const forbidden of ['fetch(', 'localStorage', 'sessionStorage']) {
  if (client.includes(forbidden)) fail(`client must not transmit or persist answers: found ${forbidden}`);
}
if (!client.includes('لا يوجد مجموع نقاط ولا نتيجة آلية')) fail('client must state that it has no score or automated result');
if (!client.includes('window.print()')) fail('client must preserve a user-controlled printable handoff');
if (!detail.includes('تركيز خاص بالموضوع')) fail('detail routes must render topic-specific focus guidance');
if (!detail.includes('حدود التفسير')) fail('detail routes must render an interpretation boundary');
if (!detail.includes('المراجع المرتبطة بهذا الموضوع والمنهج')) fail('detail routes must render topic-specific references');
if (!detail.includes('هذه الصفحة ليست خدمة طوارئ')) fail('detail route must preserve an emergency boundary fallback');
if (!detail.includes('topicGuidance?.safety')) fail('detail routes must render topic-specific safety guidance when present');

if (!process.exitCode) console.log('Guided assessment gold-standard contract passed: 50 topics, 100 preserved aliases, mandatory safety branches for critical topics, topic-specific focus/boundaries/references, no scoring or answer persistence.');
