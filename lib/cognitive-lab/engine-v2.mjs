import {
  makeCognitiveTrial as makeLegacyCognitiveTrial,
  isCognitiveAnswerCorrect,
  median,
} from './engine.mjs';
import { makeExtensionTrial, supportsExtensionMode } from './engine-extension-audit.mjs';

export function makeCognitiveTrial(tool, level, trialIndex, sessionSeed = 1) {
  if (supportsExtensionMode(tool.mode)) {
    return makeExtensionTrial(tool, level, trialIndex, sessionSeed);
  }
  return makeLegacyCognitiveTrial(tool, level, trialIndex, sessionSeed);
}

export { isCognitiveAnswerCorrect, median };
