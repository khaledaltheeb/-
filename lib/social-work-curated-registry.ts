import {
  SOCIAL_WORK_CURATED_PAGES as BASE_CURATED_PAGES,
  SOCIAL_WORK_CURATED_RELEASE,
} from '@/lib/social-work-curated-pages';
import { workingRelationshipPage } from '@/lib/social-work-curated/working-relationship';
import { desiredOutcomesPage } from '@/lib/social-work-curated/desired-outcomes';
import { strengthsPerspectivePage } from '@/lib/social-work-curated/strengths-perspective';
import { coCreatedHelpPlanPage } from '@/lib/social-work-curated/co-created-help-plan';
import { participationAndVoicePage } from '@/lib/social-work-curated/participation-and-voice';
import {
  childVoiceFamilyDecisionsPage,
  supportedDecisionMakingPage,
  involuntaryParticipationPage,
  ethicsPowerAutonomyPage,
  privacyInformationSharingPage,
  documentingDisagreementPage,
} from '@/lib/social-work-curated/rights-wave2';

export { SOCIAL_WORK_CURATED_RELEASE };

export const SOCIAL_WORK_CURATED_PAGES: Record<string, string> = {
  ...BASE_CURATED_PAGES,
  'working-relationship': workingRelationshipPage,
  'desired-outcomes': desiredOutcomesPage,
  'strengths-perspective': strengthsPerspectivePage,
  'co-created-help-plan': coCreatedHelpPlanPage,
  'participation-and-voice': participationAndVoicePage,
  'child-voice-family-decisions': childVoiceFamilyDecisionsPage,
  'supported-decision-making': supportedDecisionMakingPage,
  'involuntary-participation': involuntaryParticipationPage,
  'ethics-power-autonomy': ethicsPowerAutonomyPage,
  'privacy-information-sharing': privacyInformationSharingPage,
  'documenting-disagreement': documentingDisagreementPage,
};

export const SOCIAL_WORK_CURATED_FOUNDATION_SLUGS = [
  'agreement-on-collaboration',
  'working-relationship',
  'desired-outcomes',
  'strengths-perspective',
  'co-created-help-plan',
] as const;

export const SOCIAL_WORK_CURATED_RIGHTS_SLUGS = [
  'participation-and-voice',
  'child-voice-family-decisions',
  'supported-decision-making',
  'involuntary-participation',
  'ethics-power-autonomy',
  'privacy-information-sharing',
  'documenting-disagreement',
] as const;
