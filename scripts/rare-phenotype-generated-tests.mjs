import assert from 'node:assert/strict';
import { cleanPhenotypes } from '../app/api/rare-phenotype/rank/route.ts';

let generatedTrials = 0;
let acceptedCorrectAnswers = 0;
let rejectedWrongAnswers = 0;
let errorCount = 0;

function validId(n) {
  return `HP:${String(n % 10_000_000).padStart(7, '0')}`;
}

for (let i = 0; i < 500; i += 1) {
  generatedTrials += 1;
  try {
    const a = validId(i + 1);
    const b = validId(i + 10_001);
    const cleaned = cleanPhenotypes([a, b, a]);
    assert.deepEqual(cleaned, [a, b]);
    acceptedCorrectAnswers += 1;
  } catch (error) {
    errorCount += 1;
    console.error('valid trial failed', i, error);
  }
}

const invalidFactories = [
  (i) => [`HPO:${i}`],
  (i) => [`HP:${i}`],
  (i) => [`HP:${String(i).padStart(6, '0')}`],
  (i) => [`hp:${String(i).padStart(7, '0')}`],
  (i) => [`HP:${String(i).padStart(8, '0')}`],
  () => [null, undefined, 42, {}, []],
  () => 'HP:0000001',
  () => null,
];

for (let i = 0; i < 500; i += 1) {
  generatedTrials += 1;
  try {
    const payload = invalidFactories[i % invalidFactories.length](i + 1);
    const cleaned = cleanPhenotypes(payload);
    assert.equal(cleaned.length, 0);
    rejectedWrongAnswers += 1;
  } catch (error) {
    errorCount += 1;
    console.error('invalid trial failed', i, error);
  }
}

// Capacity/abuse boundary: valid entries beyond 30 are never forwarded upstream.
const overLimit = Array.from({ length: 80 }, (_, index) => validId(index + 100_000));
assert.equal(cleanPhenotypes(overLimit).length, 30);

const summary = {
  generated_trials: generatedTrials,
  accepted_correct_answers: acceptedCorrectAnswers,
  rejected_wrong_answers: rejectedWrongAnswers,
  error_count: errorCount,
};
console.log(JSON.stringify(summary));
assert.equal(generatedTrials, 1000);
assert.equal(acceptedCorrectAnswers, 500);
assert.equal(rejectedWrongAnswers, 500);
assert.equal(errorCount, 0);
