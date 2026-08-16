import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => { console.error(`GUIDED ASSESSMENT CONTRACT FAILED: ${message}`); process.exitCode = 1; };

const topics = JSON.parse(read('data/guided-assessment/topics.v1.json'));
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
if (!detail.includes('هذه الصفحة ليست خدمة طوارئ')) fail('detail route must include an emergency boundary');

if (!process.exitCode) console.log('Guided assessment consolidation contract passed: 50 topics, 100 legacy routes, no scoring or answer persistence.');
