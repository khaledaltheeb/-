import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pagesPath=path.join(root,'lib','social-work-talentia-pages.ts');
const routePath=path.join(root,'app','evidence-guides','social-work','[[...slug]]','route.ts');
const sitemapPath=path.join(root,'app','sitemaps','social-work.xml','route.ts');
const sitemapIndexPath=path.join(root,'app','sitemap.xml','route.ts');

function fail(message){throw new Error(`SOCIAL WORK TALENTIA CONTRACT FAILED: ${message}`)}
for(const p of [pagesPath,routePath,sitemapPath,sitemapIndexPath]) if(!fs.existsSync(p)) fail(`missing ${path.relative(root,p)}`);

const pages=fs.readFileSync(pagesPath,'utf8');
const route=fs.readFileSync(routePath,'utf8');
const sitemap=fs.readFileSync(sitemapPath,'utf8');
const sitemapIndex=fs.readFileSync(sitemapIndexPath,'utf8');

const slugs=['professional-ethics','human-dignity-social-justice','self-determination-client-rights','ethical-decision-making','professional-boundaries-conflicts','advocacy-accountability','digital-ethics-confidentiality'];
for(const slug of slugs){
  if(!pages.includes(`'${slug}'`)) fail(`missing page slug ${slug}`);
  if(!pages.includes(`social-work/${slug}/`)) fail(`canonical missing for ${slug}`);
}

const requiredTokens=[
  'c5aa171b-223d-43b7-9778-05a0d8cede8e',
  'talentias-ethical-guidelines-are-now-available-in-english',
  'global-social-work-statement-of-ethical-principles',
  'لا تعني اعتمادًا أو شراكة أو مصادقة',
  'التشريع ونظام الخدمات الفنلندي',
  'RAWAFID_TALENTIA_ETHICS_LAYER',
];
for(const token of requiredTokens) if(!pages.includes(token)) fail(`required provenance/guard token missing: ${token}`);

if(!route.includes('SOCIAL_WORK_TALENTIA_PAGES')) fail('route does not serve Talentia pages');
if(!route.includes('enrichSocialWorkPageWithTalentia')) fail('existing guides are not enriched with Talentia layer');
if(!route.includes('SOCIAL_WORK_PAGES')) fail('legacy Social Work pages are no longer preserved');
if(!sitemap.includes('SOCIAL_WORK_TALENTIA_SLUGS')||!sitemap.includes('SOCIAL_WORK_SLUGS')) fail('Social Work sitemap does not cover both restored and Talentia pages');
if(!sitemapIndex.includes('/sitemaps/social-work.xml')) fail('Social Work sitemap missing from sitemap index');

const h1Count=(pages.match(/<h1>/g)||[]).length;
if(h1Count!==slugs.length) fail(`expected ${slugs.length} h1 headings, found ${h1Count}`);

console.log(`Talentia Social Work contract passed: ${slugs.length} new pages, legacy-route preservation, source provenance, Finnish-context guard, and dedicated sitemap coverage.`);
