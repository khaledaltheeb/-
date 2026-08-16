import fs from 'node:fs';

const page = fs.readFileSync('app/start-here/page.tsx', 'utf8');
const config = fs.readFileSync('next.config.ts', 'utf8');
const sitemap = fs.readFileSync('app/sitemaps/static.xml/route.ts', 'utf8');
const fail = (message) => { console.error(`START HERE CONTRACT FAILED: ${message}`); process.exitCode = 1; };

for (const required of ['index: true', 'الأولوية الأولى', 'المسارات حسب الدور', 'المسارات حسب الهدف', 'قبل موعد الصحة النفسية أو النمو', 'طريقة القراءة', 'NIMH', 'WHO']) if (!page.includes(required)) fail(`missing page contract: ${required}`);
for (const role of ['person','family','teacher','student','professional']) if (!page.includes(`id: '${role}'`)) fail(`missing consolidated audience role: ${role}`);
for (const source of ['/audiences','/audiences/person','/audiences/family','/audiences/teacher','/audiences/student','/audiences/professional']) if (!config.includes(`source: '${source}'`)) fail(`missing historical audience redirect: ${source}`);
if (!config.includes('...legacyAudienceRedirects')) fail('historical audience redirects must be registered as one migration group');
if (!sitemap.includes("path:'/start-here'")) fail('indexable start-here route must be present in the static sitemap');
if (!process.exitCode) console.log('Start-here contract passed: one canonical hub consolidates five thin audience routes with safety, evidence and navigation.');
