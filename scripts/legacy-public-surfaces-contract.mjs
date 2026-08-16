import fs from 'node:fs';

const config = fs.readFileSync('next.config.ts','utf8');
const sitemap = fs.readFileSync('app/sitemaps/static.xml/route.ts','utf8');
const pkg = JSON.parse(fs.readFileSync('package.json','utf8'));
const files = ['app/resources/page.tsx','app/stats/page.tsx','app/sources/page.tsx','app/media-kit/page.tsx'];
const fail = (message) => { console.error(`LEGACY PUBLIC SURFACES CONTRACT FAILED: ${message}`); process.exitCode=1; };
for (const file of files) if (!fs.existsSync(file)) fail(`missing migrated public surface: ${file}`);
for (const route of ['/resources','/sources']) if (!sitemap.includes(`path:'${route}'`)) fail(`indexable migrated route absent from static sitemap: ${route}`);
if (!config.includes("source: '/team-and-partners'" ) || !config.includes("destination: '/join'")) fail('team-and-partners legacy entry must consolidate into current professional join flow');
if (!fs.readFileSync('app/stats/page.tsx','utf8').includes("index: false")) fail('live stats transparency route must remain noindex');
if (!fs.readFileSync('app/media-kit/page.tsx','utf8').includes("index: false")) fail('media kit must remain noindex until official channel inventory is verified');
if (!pkg.scripts?.['legacy-public-surfaces:validate']) fail('package validation script missing');
if (!process.exitCode) console.log('Legacy public surfaces contract passed: resources, live stats, source methodology, media kit and team/partner route are resolved.');
