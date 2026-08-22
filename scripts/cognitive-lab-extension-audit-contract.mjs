import fs from 'node:fs';
import path from 'node:path';
import { isCognitiveAnswerCorrect, makeCognitiveTrial } from '../lib/cognitive-lab/engine-v2.mjs';

const root = process.cwd();
const extensionCatalog = JSON.parse(fs.readFileSync(path.join(root, 'data/cognitive-lab/tools.v2-extension.json'), 'utf8'));
const errors = [];
const fail = (message) => errors.push(message);
const seeds = [7, 17, 31, 53, 79, 101, 137, 173, 211, 257, 307, 353];
const indices = Array.from({ length: 32 }, (_, index) => index);

if (extensionCatalog.length !== 47) fail(`expected 47 extension tools, found ${extensionCatalog.length}`);
if (extensionCatalog.some((tool) => tool.difficultyStatus !== 'review')) fail('every extension tool must remain review');

const mustBalanceAnswers = new Set([
  'numeric_comparison_speed',
  'approximate_number',
  'numerical_stroop',
  'set_shifting_cued',
  'means_end_planning',
  'category_learning',
  'feedback_rule_learning',
  'evidence_updating',
  'symmetry_detection',
  'syllogistic_reasoning',
]);

const languageModes = new Set([
  'phoneme_discrimination',
  'syllable_segmentation',
  'rhyme_judgment',
  'lexical_decision',
  'semantic_association',
  'verbal_inference',
  'ambiguity_resolution',
  'morphological_reasoning',
]);

const modeSummary = [];

for (const tool of extensionCatalog) {
  const toolAnswers = new Set();
  const toolAnswerPositions = new Set();
  const toolPrompts = new Set();
  const toolFingerprints = new Set();
  const toolDescriptors = new Set();
  let sawValueRule = false;
  let sawCountRule = false;
  let sawConflict = false;
  let sawCongruent = false;
  let sawSwitch = false;
  let sawStay = false;
  let sawForwardCoding = false;
  let sawReverseCoding = false;

  for (let level = 1; level <= 5; level += 1) {
    const levelFingerprints = new Set();
    const levelPrompts = new Set();
    const levelAnswers = new Set();
    const levelAnswerPositions = new Set();

    for (const seed of seeds) {
      for (const index of indices) {
        let trial;
        try {
          trial = makeCognitiveTrial(tool, level, index, seed);
        } catch (error) {
          fail(`${tool.slug} level ${level} generation failed: ${error instanceof Error ? error.message : String(error)}`);
          continue;
        }

        const values = trial.options.map((item) => String(item.value));
        const answer = String(trial.answer);
        const answerIndex = values.indexOf(answer);
        if (answerIndex < 0) fail(`${tool.slug} level ${level} answer missing from options`);
        if (values.filter((value) => value === answer).length !== 1) fail(`${tool.slug} level ${level} answer must appear once`);
        if (!isCognitiveAnswerCorrect(trial, answer)) fail(`${tool.slug} level ${level} rejected its own answer`);
        for (const wrong of values.filter((value) => value !== answer)) {
          if (isCognitiveAnswerCorrect(trial, wrong)) fail(`${tool.slug} level ${level} accepted wrong option ${wrong}`);
        }
        if (!trial.prompt.trim() || !trial.rationale.trim() || !trial.difficultyDescriptor.trim()) {
          fail(`${tool.slug} level ${level} has empty user-facing trial text`);
        }

        const promptKey = [trial.study ?? '', trial.prompt, trial.display ?? ''].join('::');
        levelFingerprints.add(trial.fingerprint);
        levelPrompts.add(promptKey);
        levelAnswers.add(answer);
        levelAnswerPositions.add(answerIndex);
        toolFingerprints.add(trial.fingerprint);
        toolPrompts.add(promptKey);
        toolAnswers.add(answer);
        toolAnswerPositions.add(answerIndex);
        toolDescriptors.add(trial.difficultyDescriptor);

        if (tool.mode === 'numerical_stroop') {
          if (trial.prompt.includes('قيمة الرقم')) sawValueRule = true;
          if (trial.prompt.includes('عدد الرموز')) sawCountRule = true;
          if (trial.difficultyDescriptor.includes('تعارض')) sawConflict = true;
          if (trial.difficultyDescriptor.includes('توافق')) sawCongruent = true;
        }
        if (tool.mode === 'set_shifting_cued') {
          if (trial.rationale.includes('حدث تبديل')) sawSwitch = true;
          if (trial.rationale.includes('استمرت القاعدة')) sawStay = true;
        }
        if (tool.mode === 'symbol_coding' && level >= 2) {
          if (trial.prompt.includes('ما الرقم المقابل')) sawForwardCoding = true;
          if (trial.prompt.includes('أي رمز يقابل الرقم')) sawReverseCoding = true;
        }
      }
    }

    const minimumFingerprints = languageModes.has(tool.mode) ? 6 : 8;
    if (levelFingerprints.size < minimumFingerprints) {
      fail(`${tool.slug} level ${level} has only ${levelFingerprints.size} fingerprints; expected >= ${minimumFingerprints}`);
    }
    if (levelPrompts.size < (languageModes.has(tool.mode) ? 6 : 4)) {
      fail(`${tool.slug} level ${level} has insufficient trial-content diversity (${levelPrompts.size})`);
    }
    if (mustBalanceAnswers.has(tool.mode) && levelAnswers.size < 2) {
      fail(`${tool.slug} level ${level} collapses to one answer value: ${[...levelAnswers].join(', ')}`);
    }
    if (levelAnswerPositions.size < 2) {
      fail(`${tool.slug} level ${level} correct option remains in one position only`);
    }
  }

  if (new Set(Array.from({ length: 5 }, (_, index) => index + 1)).size !== 5) fail('internal level invariant failed');
  if (toolDescriptors.size < 5) fail(`${tool.slug} does not expose five distinct difficulty descriptions`);
  if (mustBalanceAnswers.has(tool.mode) && toolAnswers.size < 2) fail(`${tool.slug} does not balance answer values across the audit corpus`);
  if (toolAnswerPositions.size < 2) fail(`${tool.slug} does not vary answer position across the audit corpus`);

  if (tool.mode === 'numerical_stroop' && !(sawValueRule && sawCountRule && sawConflict && sawCongruent)) {
    fail('numerical-stroop audit did not observe both relevant dimensions and both congruent/conflict trials');
  }
  if (tool.mode === 'set_shifting_cued' && !(sawSwitch && sawStay)) {
    fail('set-shifting-cued audit did not observe both switch and stay trials');
  }
  if (tool.mode === 'symbol_coding' && !(sawForwardCoding && sawReverseCoding)) {
    fail('symbol-coding audit did not observe both coding directions');
  }

  modeSummary.push({
    slug: tool.slug,
    mode: tool.mode,
    fingerprints: toolFingerprints.size,
    trialContentVariants: toolPrompts.size,
    answerValues: toolAnswers.size,
    answerPositions: toolAnswerPositions.size,
    difficultyDescriptions: toolDescriptors.size,
  });
}

const report = {
  version: 1,
  status: errors.length ? 'failed' : 'passed',
  extensionTools: extensionCatalog.length,
  sampledTrials: extensionCatalog.length * 5 * seeds.length * indices.length,
  errors: [...new Set(errors)],
  modes: modeSummary,
};

console.log(JSON.stringify(report, null, 2));
if (errors.length) process.exit(1);
