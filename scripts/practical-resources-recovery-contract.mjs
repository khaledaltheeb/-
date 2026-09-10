import fs from 'node:fs';

const source = fs.readFileSync('lib/practical-resources.ts', 'utf8');
const staticSitemap = fs.readFileSync('app/sitemaps/static.xml/route.ts', 'utf8');
const worksheetSitemap = fs.readFileSync('app/sitemaps/practical-worksheets.xml/route.ts', 'utf8');
const rootSitemap = fs.readFileSync('app/sitemap.xml/route.ts', 'utf8');
const infographicRoute = fs.readFileSync('app/resources/infographics/[slug]/page.tsx', 'utf8');
const worksheetRoute = fs.readFileSync('app/resources/worksheets/[slug]/page.tsx', 'utf8');
const mediaPage = fs.readFileSync('app/media/page.tsx', 'utf8');

const infographicSlugs = [
  'aphasia-supported-conversation',
  'easy-read-arabic-checklist',
  'adhd-girls-assessment-prep',
  'audhd-support-map',
  'autistic-burnout-load-map',
  'dld-arabic-classroom-support',
  'accessible-travel-verification',
  'rare-disease-appointment-file',
  'addiction-content-safety-review',
];
const worksheetSlugs = [
  'aphasia-communication-profile',
  'neurodivergent-load-audit',
  'rare-disease-visit-brief',
];

let failed = false;
const fail = (message) => { console.error(`PRACTICAL_RECOVERY_FAIL: ${message}`); failed = true; };

for (const slug of [...infographicSlugs, ...worksheetSlugs]) {
  const count = source.split(`slug:'${slug}'`).length - 1;
  if (count !== 1) fail(`${slug} must exist exactly once; found ${count}`);
}

if (!source.includes("export const resourceSafetyNote='هذه المواد للتثقيف وتنظيم الأسئلة والدعم، ولا تشخّص اضطرابًا ولا تستبدل التقييم أو العلاج أو خدمات الطوارئ المحلية.'")) {
  fail('shared non-diagnostic safety boundary was changed or removed');
}
if (!staticSitemap.includes("import { infographics } from '@/lib/practical-resources'")) fail('static sitemap no longer derives infographic routes from practical resources');
if (!infographicRoute.includes('generateStaticParams') || !infographicRoute.includes('infographics.map')) fail('infographic detail route must generate all registered slugs');
if (!worksheetRoute.includes('generateStaticParams') || !worksheetRoute.includes('worksheets.map')) fail('worksheet detail route must generate all registered slugs');
if ((!worksheetRoute.includes('index:true') && !worksheetRoute.includes('index: true')) || (!worksheetRoute.includes('follow:true') && !worksheetRoute.includes('follow: true'))) fail('worksheet index/follow boundary must remain explicit');
if (!worksheetSitemap.includes("import { worksheets } from '@/lib/practical-resources'")) fail('worksheet sitemap must derive routes from practical resource registry');
if (!worksheetSitemap.includes('`/resources/worksheets/${item.slug}`')) fail('worksheet sitemap must include worksheet detail routes');
if (!rootSitemap.includes('/sitemaps/practical-worksheets.xml')) fail('root sitemap must register public worksheet sitemap');
if (!mediaPage.includes("import { infographics, worksheets } from '@/lib/practical-resources'")) fail('media center must remain driven by the same practical resource registry');

const slugMatches = [...source.matchAll(/slug:'([^']+)'/g)].map((match) => match[1]);
const duplicates = slugMatches.filter((slug, index) => slugMatches.indexOf(slug) !== index);
if (duplicates.length) fail(`duplicate practical-resource slugs found: ${[...new Set(duplicates)].join(', ')}`);

if (failed) process.exit(1);
console.log(`PRACTICAL_RECOVERY_OK: ${infographicSlugs.length} infographics + ${worksheetSlugs.length} worksheets recovered, public detail pages index/follow, dedicated worksheet sitemap registered.`);
