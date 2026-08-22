import fs from 'node:fs';
import path from 'node:path';
import { isCognitiveAnswerCorrect, makeCognitiveTrial } from '../lib/cognitive-lab/engine-v2.mjs';

const root = process.cwd();
const catalogPath = path.join(root, 'data/cognitive-lab/tools.v1.json');
const extensionPath = path.join(root, 'data/cognitive-lab/tools.v2-extension.json');
const legacyCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const extensionCatalog = JSON.parse(fs.readFileSync(extensionPath, 'utf8'));
const catalog = [...legacyCatalog, ...extensionCatalog];
const expectedVerifiedModes = new Set([
  'choice_reaction',
  'visual_reaction',
  'response_inhibition',
  'conditional_reasoning',
  'context_clues',
  'emotion_recognition',
  'perspective_taking',
  'planning_steps',
  'priority_planning',
  'problem_solving',
  'word_categories',
  'semantic_fluency',
  'social_scenarios',
  'verbal_analogy',
]);
const forbiddenClinicalModes = new Set(['phq_9', 'gad_7', 'who_5', 'audit_10']);
const errors = [];
const fail = (message) => errors.push(message);

if (legacyCatalog.length !== 53) fail(`expected 53 legacy tools, found ${legacyCatalog.length}`);
if (extensionCatalog.length !== 47) fail(`expected 47 extension tools, found ${extensionCatalog.length}`);
if (catalog.length !== 100) fail(`expected 100 tools, found ${catalog.length}`);
if (new Set(catalog.map((tool) => tool.slug)).size !== catalog.length) fail('tool slugs must be unique');
if (new Set(catalog.map((tool) => tool.mode)).size !== catalog.length) fail('tool modes must be unique');
if (catalog.filter((tool) => tool.difficultyStatus === 'verified').length !== 14) fail('exactly 14 tools must have verified difficulty');
if (extensionCatalog.some((tool) => tool.difficultyStatus !== 'review')) fail('all extension tools must remain review until human/psychometric validation');

for (const tool of catalog) {
  for (const field of ['slug', 'title', 'category', 'mode', 'summary', 'instructions', 'difficultyStatus']) {
    if (!String(tool[field] ?? '').trim()) fail(`${tool.slug || 'unknown'} missing ${field}`);
  }
  if (!/^[a-z0-9-]+$/.test(tool.slug)) fail(`${tool.slug} has an unsafe slug`);
  if (!['verified', 'review'].includes(tool.difficultyStatus)) fail(`${tool.slug} has invalid difficultyStatus`);
  if (forbiddenClinicalModes.has(tool.mode)) fail(`${tool.slug} exposes a quarantined clinical scale`);
  const shouldBeVerified = expectedVerifiedModes.has(tool.mode);
  if (shouldBeVerified !== (tool.difficultyStatus === 'verified')) fail(`${tool.slug} difficulty provenance mismatch`);
}

const seeds = [17, 31, 53, 79, 101, 137, 173, 211];
const indices = Array.from({ length: 24 }, (_, index) => index);
let generatedTrials = 0;
let acceptedCorrectAnswers = 0;
let rejectedWrongAnswers = 0;
let minimumUniqueFingerprints = Number.POSITIVE_INFINITY;
const rows = [];

for (const tool of catalog) {
  const signatures = [];
  const levelRows = [];
  for (let level = 1; level <= 5; level += 1) {
    const fingerprints = new Set();
    const levelSignatures = new Set();
    for (const seed of seeds) {
      for (const index of indices) {
        let trial;
        try {
          trial = makeCognitiveTrial(tool, level, index, seed);
        } catch (error) {
          fail(`${tool.slug} level ${level}: ${error instanceof Error ? error.message : String(error)}`);
          continue;
        }
        generatedTrials += 1;
        if (!trial.prompt.trim() || !trial.rationale.trim()) fail(`${tool.slug} level ${level} has empty instructional content`);
        if (trial.level !== level) fail(`${tool.slug} level metadata mismatch`);
        const values = trial.options.map((item) => String(item.value));
        if (new Set(values).size !== values.length) fail(`${tool.slug} level ${level} has duplicate options`);
        if (values.filter((value) => value === String(trial.answer)).length !== 1) fail(`${tool.slug} level ${level} answer cardinality is not one`);
        if (tool.mode !== 'simple_reaction' && values.length < 2) fail(`${tool.slug} level ${level} has fewer than two choices`);
        if (isCognitiveAnswerCorrect(trial, trial.answer)) acceptedCorrectAnswers += 1;
        else fail(`${tool.slug} level ${level} rejected its correct answer`);
        for (const wrong of values.filter((value) => value !== String(trial.answer))) {
          if (isCognitiveAnswerCorrect(trial, wrong)) fail(`${tool.slug} level ${level} accepted a wrong answer`);
          else rejectedWrongAnswers += 1;
        }
        fingerprints.add(trial.fingerprint);
        levelSignatures.add(trial.difficultySignature);
      }
    }
    const uniqueFingerprints = fingerprints.size;
    minimumUniqueFingerprints = Math.min(minimumUniqueFingerprints, uniqueFingerprints);
    const minimumRequired = tool.difficultyStatus === 'verified' ? 24 : 4;
    if (uniqueFingerprints < minimumRequired) fail(`${tool.slug} level ${level} bank ${uniqueFingerprints} < ${minimumRequired}`);
    if (levelSignatures.size !== 1) fail(`${tool.slug} level ${level} has unstable difficulty metadata`);
    signatures.push([...levelSignatures][0]);
    levelRows.push({ level, uniqueFingerprints, difficultySignature: [...levelSignatures][0] });
  }
  if (tool.difficultyStatus === 'verified' && new Set(signatures).size !== 5) {
    fail(`${tool.slug} does not expose five distinct verified difficulty signatures`);
  }
  rows.push({ slug: tool.slug, status: tool.difficultyStatus, levels: levelRows });
}

const report = {
  version: 2,
  status: errors.length ? 'failed' : 'passed',
  tools: catalog.length,
  legacyTools: legacyCatalog.length,
  extensionTools: extensionCatalog.length,
  verifiedDifficultyTools: catalog.filter((tool) => tool.difficultyStatus === 'verified').length,
  generatedTrials,
  acceptedCorrectAnswers,
  rejectedWrongAnswers,
  minimumUniqueFingerprints,
  errorCount: errors.length,
  errors: [...new Set(errors)],
  rows,
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exit(1);
