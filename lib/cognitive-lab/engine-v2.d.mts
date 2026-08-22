export type CognitiveOption = {
  value: string;
  label: string;
  tone?: string;
};

export type CognitiveTrial = {
  kind: 'choice' | 'memory' | 'audio' | 'reaction' | 'stroop';
  prompt: string;
  display?: string;
  displayTone?: string;
  study?: string;
  answer: string;
  options: CognitiveOption[];
  rationale: string;
  level: number;
  difficultyDescriptor: string;
  difficultySignature: string;
  fingerprint: string;
  audioCount?: number;
  reactionDelay?: number;
};

export type CognitiveToolInput = {
  slug: string;
  mode: string;
  title?: string;
};

export function makeCognitiveTrial(tool: CognitiveToolInput, level: number, trialIndex: number, sessionSeed?: number): CognitiveTrial;
export function isCognitiveAnswerCorrect(trial: CognitiveTrial, value: string): boolean;
export function median(values: number[]): number;
