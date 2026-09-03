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
import {
  multiChallengedFamiliesPage,
  familyResiliencePage,
  familyEngagementBarriersPage,
  collaborativeProfessionalInterviewPage,
  solutionFocusedConversationsPage,
  homeBasedFamilySocialWorkPage,
  rebuildingTrustAfterHarmPage,
  professionalPersistencePage,
} from '@/lib/social-work-curated/family-wave3';
import {
  communityResourceMapPage,
  supportNetworkMappingPage,
  serviceCoordinationPage,
  referralWithContinuityPage,
} from '@/lib/social-work-curated/community-wave4-a';
import {
  multidisciplinaryFamilyMeetingPage,
  communityPartnershipFamilySupportPage,
  failedReferralRecoveryPage,
  institutionalAdvocacyPage,
} from '@/lib/social-work-curated/community-wave4-b';
import {
  familyLifeCourseTransitionsPage,
  separationDivorceFamilySupportPage,
  olderAdultsFamilySupportPage,
  caregiverRoleBurdenPage,
} from '@/lib/social-work-curated/life-course-wave5-a';
import {
  transitionToAdulthoodPage,
  fosterCareAdoptionFamilyWorkPage,
  youthComplexBehaviourFamilyWorkPage,
  schoolFamilyCollaborationPage,
} from '@/lib/social-work-curated/life-course-wave5-b';
import {
  povertyStructuralBarriersPage,
  financialCrisisFamilyPlanPage,
  familyRoleRedistributionPage,
  familyPrioritySettingPage,
  familyBurdenMonitoringPage,
} from '@/lib/social-work-curated/structural-wave6-a';
import {
  helpPlanQualityAuditPage,
  communityIndependencePlanPage,
  serviceExitPlanPage,
  postClosureFollowUpPage,
} from '@/lib/social-work-curated/structural-wave6-b';

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
  'multi-challenged-families': multiChallengedFamiliesPage,
  'family-resilience': familyResiliencePage,
  'family-engagement-barriers': familyEngagementBarriersPage,
  'collaborative-professional-interview': collaborativeProfessionalInterviewPage,
  'solution-focused-conversations': solutionFocusedConversationsPage,
  'home-based-family-social-work': homeBasedFamilySocialWorkPage,
  'rebuilding-trust-after-harm': rebuildingTrustAfterHarmPage,
  'professional-persistence': professionalPersistencePage,
  'community-resource-map': communityResourceMapPage,
  'support-network-mapping': supportNetworkMappingPage,
  'service-coordination': serviceCoordinationPage,
  'referral-with-continuity': referralWithContinuityPage,
  'multidisciplinary-family-meeting': multidisciplinaryFamilyMeetingPage,
  'community-partnership-family-support': communityPartnershipFamilySupportPage,
  'failed-referral-recovery': failedReferralRecoveryPage,
  'institutional-advocacy': institutionalAdvocacyPage,
  'family-life-course-transitions': familyLifeCourseTransitionsPage,
  'separation-divorce-family-support': separationDivorceFamilySupportPage,
  'older-adults-family-support': olderAdultsFamilySupportPage,
  'caregiver-role-burden': caregiverRoleBurdenPage,
  'transition-to-adulthood': transitionToAdulthoodPage,
  'foster-care-adoption-family-work': fosterCareAdoptionFamilyWorkPage,
  'youth-complex-behaviour-family-work': youthComplexBehaviourFamilyWorkPage,
  'school-family-collaboration': schoolFamilyCollaborationPage,
  'poverty-structural-barriers': povertyStructuralBarriersPage,
  'financial-crisis-family-plan': financialCrisisFamilyPlanPage,
  'family-role-redistribution': familyRoleRedistributionPage,
  'family-priority-setting': familyPrioritySettingPage,
  'family-burden-monitoring': familyBurdenMonitoringPage,
  'help-plan-quality-audit': helpPlanQualityAuditPage,
  'community-independence-plan': communityIndependencePlanPage,
  'service-exit-plan': serviceExitPlanPage,
  'post-closure-follow-up': postClosureFollowUpPage,
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

export const SOCIAL_WORK_CURATED_FAMILY_SLUGS = [
  'multi-challenged-families',
  'family-resilience',
  'family-engagement-barriers',
  'collaborative-professional-interview',
  'solution-focused-conversations',
  'home-based-family-social-work',
  'rebuilding-trust-after-harm',
  'professional-persistence',
] as const;

export const SOCIAL_WORK_CURATED_COMMUNITY_SLUGS = [
  'community-resource-map',
  'support-network-mapping',
  'service-coordination',
  'referral-with-continuity',
  'multidisciplinary-family-meeting',
  'community-partnership-family-support',
  'failed-referral-recovery',
  'institutional-advocacy',
] as const;

export const SOCIAL_WORK_CURATED_LIFE_COURSE_SLUGS = [
  'family-life-course-transitions',
  'separation-divorce-family-support',
  'older-adults-family-support',
  'caregiver-role-burden',
  'transition-to-adulthood',
  'foster-care-adoption-family-work',
  'youth-complex-behaviour-family-work',
  'school-family-collaboration',
] as const;

export const SOCIAL_WORK_CURATED_STRUCTURAL_SLUGS = [
  'poverty-structural-barriers',
  'financial-crisis-family-plan',
  'family-role-redistribution',
  'family-priority-setting',
  'family-burden-monitoring',
  'help-plan-quality-audit',
  'community-independence-plan',
  'service-exit-plan',
  'post-closure-follow-up',
] as const;
