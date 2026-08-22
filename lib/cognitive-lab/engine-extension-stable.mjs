import { makeExtensionTrial as makeHardenedExtensionTrial, supportsExtensionMode } from './engine-extension-hardening.mjs';

export { supportsExtensionMode };

export function makeExtensionTrial(tool, level, trialIndex, sessionSeed = 1) {
  const normalizedLevel = Math.min(5, Math.max(1, Math.trunc(Number(level) || 1)));
  const trial = makeHardenedExtensionTrial(tool, normalizedLevel, trialIndex, sessionSeed);
  return {
    ...trial,
    difficultySignature: `${tool.mode}:level:${normalizedLevel}`,
  };
}
