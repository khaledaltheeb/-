import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pagesPath=path.join(root,'lib','social-work-comparative-pages.ts');
const routePath=path.join(root,'app','evidence-guides','social-work','[[...slug]]','route.ts');
const sitemapPath=path.join(root,'app','sitemaps','social-work.xml','route.ts');
const talentiaPath=path.join(root,'lib','social-work-talentia-pages.ts');

function fail(message){throw new Error(`SOCIAL WORK COMPARATIVE CONTRACT FAILED: ${message}`)}
for(const p of [pagesPath,routePath,sitemapPath,talentiaPath]) if(!fs.existsSync(p)) fail(`missing ${path.relative(root,p)}`);

const pages=fs.readFileSync(pagesPath,'utf8');
const route=fs.readFileSync(routePath,'utf8');
const sitemap=fs.readFileSync(sitemapPath,'utf8');
const talentia=fs.readFileSync(talentiaPath,'utf8');

const gapSlugs=[
  'needs-assessment-ethical-practice',
  'professional-records-documentation',
  'organizational-duty-client-interest-conflict',
  'supervision-ethical-consultation',
  'complaints-review-procedural-fairness',
  'cultural-humility-anti-discrimination',
  'language-access-interpreters',
  'competence-scope-referral',
  'fair-service-prioritization',
  'caseload-workload-ethical-risk',
  'interprofessional-role-clarity',
  'safeguarding-confidentiality-thresholds',
  'accessible-social-services-accommodations',
  'trauma-informed-ethical-practice',
];
const hub='international-comparative-social-work-ethics';
const newSlugs=[hub,...gapSlugs];

for(const slug of newSlugs) if(!pages.includes(`'${slug}'`)) fail(`missing page slug ${slug}`);
if(newSlugs.length!==15) fail(`expected conservative 15-page release, got ${newSlugs.length}`);

const forbiddenSlugTerms=['finland','finnish','switzerland','swiss','lithuania','lithuanian','talentia','avenirsocial','lsda'];
for(const slug of newSlugs){
  for(const term of forbiddenSlugTerms) if(slug.includes(term)) fail(`agency/country-centric slug is forbidden: ${slug}`);
}

const provenanceTokens=[
  'berufskodex_de_2026-07.pdf',
  'code_de_deontologie_fr_2026-07.pdf',
  'f596df101af111eeb233e8b04dc9bb3d',
  'pktc.lt/metodine-informacija/metodine-medziaga',
  'c5aa171b-223d-43b7-9778-05a0d8cede8e',
  'global-social-work-statement-of-ethical-principles',
  'Convention on the Rights of Persons with Disabilities',
  'لا يعني اعتمادًا أو شراكة أو مصادقة',
  'لا تُنقل الأحكام القانونية أو التنظيمية',
];
for(const token of provenanceTokens) if(!pages.includes(token)) fail(`missing provenance/context guard: ${token}`);

for(const heading of ['المبدأ المهني العام','الممارسة الموصى بها','القانون أو التنظيم المحلي: ما يمكن نقله للسياق العربي وما لا يمكن نقله']) {
  if(!pages.includes(heading)) fail(`missing comparison layer heading: ${heading}`);
}

if(!pages.includes('ما لم ننشئه عمدًا')) fail('anti-cannibalization editorial statement missing');
if(!pages.includes('لا توجد هنا سلسلة صفحات متطابقة')) fail('country-page duplication guard missing');
if(!pages.includes('Article')) fail('Article structured data missing');
if(!pages.includes('canonical')) fail('canonical metadata missing');

// Pages are generated from one gap template plus one explicit hub template, so static
// source H1 counting is invalid. Guard both render paths instead.
if(!pages.includes('<h1>${spec.title}</h1>')) fail('gap-page H1 render template missing');
if(!pages.includes('<h1>الممارسة والأخلاقيات في العمل الاجتماعي: مقارنة دولية</h1>')) fail('comparative hub H1 missing');
if(!pages.includes('gapPages.map((spec)=>[spec.slug,buildGapPage(spec)])')) fail('gap pages are not rendered through the guarded builder');

for(const token of [
  'SOCIAL_WORK_COMPARATIVE_PAGES',
  'enrichSocialWorkPageWithComparativeSources',
  'RAWAFID_COMPARATIVE_SOCIAL_WORK_LAYER',
]) if(!route.includes(token)) fail(`route integration missing ${token}`);

if(!route.includes('SOCIAL_WORK_TALENTIA_PAGES')) fail('Talentia pages no longer preserved');
if(!route.includes('SOCIAL_WORK_PAGES')) fail('recovered social-work pages no longer preserved');
if(!route.includes('hardenTalentiaPageQuality')) fail('Talentia quality hardening no longer applied');
if(!route.includes('enrichSocialWorkPageWithTalentia')) fail('Talentia enrichment no longer applied');

if(!sitemap.includes('SOCIAL_WORK_COMPARATIVE_SLUGS')) fail('comparative slugs absent from social-work sitemap');
if(!sitemap.includes('SOCIAL_WORK_TALENTIA_SLUGS')) fail('Talentia sitemap coverage regressed');
if(!sitemap.includes('SOCIAL_WORK_SLUGS')) fail('recovered sitemap coverage regressed');

const existingTopics=[
  'privacy-information-sharing',
  'referral-with-continuity',
  'service-coordination',
  'documenting-disagreement',
  'participation-and-voice',
  'supported-decision-making',
];
for(const slug of existingTopics){
  if(!pages.includes(`'${slug}'`)) fail(`existing topic is not enriched/linked: ${slug}`);
  if(gapSlugs.includes(slug)) fail(`existing topic incorrectly duplicated as a new gap page: ${slug}`);
}

for(const token of ['professional-ethics','human-dignity-social-justice','self-determination-client-rights','ethical-decision-making']) {
  if(!talentia.includes(`'${token}'`)) fail(`expected Talentia foundation missing: ${token}`);
}

console.log(`Comparative Social Work contract passed: ${newSlugs.length} new topic-first pages (${gapSlugs.length} verified gaps + 1 comparative hub), existing-topic enrichment, jurisdiction guards, source provenance, anti-cannibalization rules, canonical/schema metadata, legacy/Talentia preservation, and sitemap coverage.`);
