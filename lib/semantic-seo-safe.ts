import {
  buildSemanticSeoProfile as buildBaseSemanticSeoProfile,
  type SemanticSeoInput,
  type SemanticSeoProfile,
} from '@/lib/semantic-seo';

function replaceAmbiguousRecoveryTerms(value: string | null | undefined) {
  if (!value) return value;
  return value
    .replace(/\brecovery\b/gi, 'improvement')
    .replace(/\brecuperaci[oó]n\b/gi, 'mejoría')
    .replace(/التعافي/gu, 'التحسن');
}

function stabilizeExplicitPathDomain(input: SemanticSeoInput): SemanticSeoInput {
  const path = input.path.toLowerCase();

  // Recovery is a valid mental-health concept as well as an addiction concept.
  // The base classifier intentionally recognizes addiction terms, but an explicit
  // mental-health route must not be reclassified merely because prose mentions
  // recovery. Strong addiction routes (/addiction/, substance-use paths) are left
  // untouched and continue to use the addiction vocabulary.
  if (/\/(?:en|es\/)?mental-health(?:\/|$)/.test(path) || /\/mental-health(?:\/|$)/.test(path)) {
    return {
      ...input,
      title: replaceAmbiguousRecoveryTerms(input.title) || input.title,
      description: replaceAmbiguousRecoveryTerms(input.description),
      keywords: input.keywords?.map((value) => replaceAmbiguousRecoveryTerms(value) || value),
      relatedTerms: input.relatedTerms?.map((value) => replaceAmbiguousRecoveryTerms(value) || value),
      searchIntents: input.searchIntents?.map((value) => replaceAmbiguousRecoveryTerms(value) || value),
    };
  }

  return input;
}

export function buildSemanticSeoProfile(input: SemanticSeoInput): SemanticSeoProfile {
  return buildBaseSemanticSeoProfile(stabilizeExplicitPathDomain(input));
}
