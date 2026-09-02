import fs from 'node:fs';
import path from 'node:path';

// Contract for the Talentia-backed ethics expansion; keep independent from the historical recovery contract.
const root=process.cwd();
const pagesPath=path.join(root,'lib','social-work-talentia-pages.ts');
const inlinePath=path.join(root,'lib','social-work-talentia-inline-links.ts');
const qualityPath=path.join(root,'lib','social-work-talentia-quality.ts');
const routePath=path.join(root,'app','evidence-guides','social-work','[[...slug]]','route.ts');
const sitemapPath=path.join(root,'app','sitemaps','social-work.xml','route.ts');
const sitemapIndexPath=path.join(root,'app','sitemap.xml','route.ts');

function fail(message){throw new Error(`SOCIAL WORK TALENTIA CONTRACT FAILED: ${message}`)}
for(const p of [pagesPath,inlinePath,qualityPath,routePath,sitemapPath,sitemapIndexPath]) if(!fs.existsSync(p)) fail(`missing ${path.relative(root,p)}`);

const pages=fs.readFileSync(pagesPath,'utf8');
const inline=fs.readFileSync(inlinePath,'utf8');
const quality=fs.readFileSync(qualityPath,'utf8');
const route=fs.readFileSync(routePath,'utf8');
const sitemap=fs.readFileSync(sitemapPath,'utf8');
const sitemapIndex=fs.readFileSync(sitemapIndexPath,'utf8');

const slugs=['professional-ethics','human-dignity-social-justice','self-determination-client-rights','ethical-decision-making','professional-boundaries-conflicts','advocacy-accountability','digital-ethics-confidentiality'];
for(const slug of slugs){
  if(!pages.includes(`'${slug}'`)) fail(`missing page slug ${slug}`);
}
if(!pages.includes('https://healthrenewal.org/evidence-guides/social-work/${slug}/')) fail('dynamic canonical template missing');

const requiredTokens=[
  'c5aa171b-223d-43b7-9778-05a0d8cede8e',
  'talentias-ethical-guidelines-are-now-available-in-english',
  'global-social-work-statement-of-ethical-principles',
  'لا تعني اعتمادًا أو شراكة أو مصادقة',
  'التشريع ونظام الخدمات الفنلندي',
  'RAWAFID_TALENTIA_ETHICS_LAYER',
];
for(const token of requiredTokens) if(!pages.includes(token)) fail(`required provenance/guard token missing: ${token}`);

const inlineSlugs=['human-dignity-social-justice','self-determination-client-rights','ethical-decision-making'];
for(const slug of inlineSlugs){
  if(!inline.includes(`'${slug}'`)) fail(`missing inline Talentia reference for ${slug}`);
  if(!inline.includes(`data-talentia-inline-reference=\"${slug}\"`)) fail(`missing inline marker for ${slug}`);
}
for(const token of ['TALENTIA_GUIDE','TALENTIA_NEWS','enrichTalentiaPageWithInlineLinks']) if(!inline.includes(token)) fail(`inline Talentia link contract missing ${token}`);
if(!route.includes('enrichTalentiaPageWithInlineLinks')) fail('route does not inject contextual Talentia links into three guides');

for(const token of ['hardenTalentiaPageQuality','data-rawafid-quality-note=\"editorial-tool\"','data-rawafid-quality-note=\"scope\"','آخر مراجعة تحريرية ومصدرية: 31 أغسطس 2026','ليست قائمة رسمية صادرة عن Talentia']) {
  if(!(quality+route).includes(token)) fail(`quality hardening token missing: ${token}`);
}
if(!quality.includes('إذا تغيب أحد المستفيدين عن مواعيد متعددة')) fail('Arabic correction for missed appointments is absent');
if(!route.includes('hardenTalentiaPageQuality')) fail('route does not apply Talentia quality hardening');

if(!route.includes('SOCIAL_WORK_TALENTIA_PAGES')) fail('route does not serve Talentia pages');
if(!route.includes('enrichSocialWorkPageWithTalentia')) fail('existing guides are not enriched with Talentia layer');
if(!route.includes('SOCIAL_WORK_PAGES')) fail('legacy Social Work pages are no longer preserved');
if(!sitemap.includes('SOCIAL_WORK_TALENTIA_SLUGS')||!sitemap.includes('SOCIAL_WORK_SLUGS')) fail('Social Work sitemap does not cover both restored and Talentia pages');
if(!sitemapIndex.includes('/sitemaps/social-work.xml')) fail('Social Work sitemap missing from sitemap index');

const h1Count=(pages.match(/<h1>/g)||[]).length;
if(h1Count!==slugs.length) fail(`expected ${slugs.length} h1 headings, found ${h1Count}`);

console.log(`Talentia Social Work contract passed: ${slugs.length} new pages, contextual Talentia links in ${inlineSlugs.length} guides, editorial-tool attribution, scope guard, legacy-route preservation, source provenance, Finnish-context guard, and dedicated sitemap coverage.`);
