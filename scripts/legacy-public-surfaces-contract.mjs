import fs from 'node:fs';
const config=fs.readFileSync('next.config.ts','utf8');
const sitemap=fs.readFileSync('app/sitemaps/static.xml/route.ts','utf8');
const publicHubsSitemap=fs.readFileSync('app/sitemaps/public-hubs.xml/route.ts','utf8');
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
const files=['app/resources/page.tsx','app/stats/page.tsx','app/sources/page.tsx','app/media-kit/page.tsx','app/team-and-partners/page.tsx'];
const fail=(message)=>{console.error(`LEGACY PUBLIC SURFACES CONTRACT FAILED: ${message}`);process.exitCode=1};
for(const file of files)if(!fs.existsSync(file))fail(`missing migrated public surface: ${file}`);
for(const route of ['/resources','/sources'])if(!sitemap.includes(`path:'${route}'`))fail(`indexable migrated route absent from static sitemap: ${route}`);
for(const route of ['/stats','/media-kit','/team-and-partners'])if(!publicHubsSitemap.includes(`path: '${route}'`))fail(`indexable migrated public hub absent from public-hubs sitemap: ${route}`);
if(config.includes("source: '/team-and-partners'"))fail('team-and-partners must be a real content route, not a migration redirect');
const team=fs.readFileSync('app/team-and-partners/page.tsx','utf8');
for(const required of ['المختصون والشراكات العلمية','الموافقة قبل النشر','البيانات الخاصة','حالة التحقق'])if(!team.includes(required))fail(`team/partners transfer missing: ${required}`);
for(const file of ['app/stats/page.tsx','app/media-kit/page.tsx']){
 const page=fs.readFileSync(file,'utf8');
 if(!page.includes('index: true'))fail(`${file} must remain indexable as a public institutional surface`);
 if(!page.includes('follow: true'))fail(`${file} must remain followable as a public institutional surface`);
}
if(!pkg.scripts?.['legacy-public-surfaces:validate'])fail('package validation script missing');
if(!process.exitCode)console.log('Legacy public surfaces contract passed: migrated public content, stats, media kit and team/partners remain real indexable pages with sitemap discovery.');
