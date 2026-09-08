import fs from 'node:fs';

const page = fs.readFileSync('app/evidence-guides/als-mnd/[[...slug]]/page.tsx', 'utf8');
const sitemap = fs.readFileSync('app/sitemaps/als-mnd.xml/route.ts', 'utf8');
const sitemapIndex = fs.readFileSync('app/sitemap.xml/route.ts', 'utf8');
let failed = false;
const fail = (message) => { console.error(`ALS_MND_RECOVERY_FAIL: ${message}`); failed = true; };

const routes = [
  '/evidence-guides/als-mnd/',
  '/evidence-guides/als-mnd/understanding/',
  '/evidence-guides/als-mnd/living/',
  '/evidence-guides/als-mnd/treatment/',
  '/evidence-guides/als-mnd/action/',
];
for (const route of routes) if (!sitemap.includes(`'${route}'`)) fail(`ALS/MND sitemap missing ${route}`);
if (!sitemapIndex.includes("'/sitemaps/als-mnd.xml'")) fail('root sitemap index is missing ALS/MND sitemap');
for (const marker of ['فهم ALS/MND', 'العيش مع ALS/MND', 'العلاج والرعاية', 'اتخاذ إجراء', 'International Alliance of ALS/MND Associations', 'لا يعني أن Alliance راجعت هذه الصفحات أو اعتمدتها أو أيدت روافد']) {
  if (!page.includes(marker)) fail(`page missing required marker: ${marker}`);
}
for (const url of ['https://www.als-mnd.org/about-us/als-mnd-health-literacy-map/', 'https://www.als-mnd.org/find-als-mnd-association/']) {
  if (!page.includes(url)) fail(`source URL missing: ${url}`);
}
for (const internal of ['/content/palliative-care-als-motor-neuron-disease', '/capabilities/amyotrophic-lateral-sclerosis/']) {
  if (!page.includes(internal)) fail(`existing Rawafid route must be reused: ${internal}`);
}
if (!page.includes('<SiteHeader />') || !page.includes('<SiteFooter />')) fail('recovered route must use the current site shell');
if (!page.includes("index: true") || !page.includes("follow: true")) fail('reviewed ALS/MND evidence path must remain indexable/followable');
if (!page.includes("['MedicalWebPage', 'Article']") || !page.includes("'CollectionPage'")) fail('structured-data ownership markers are missing');
if (page.includes('permanentRedirect(')) fail('recovery must not replace routes with redirects');

if (failed) process.exit(1);
console.log(`ALS_MND_RECOVERY_OK: ${routes.length} reviewed indexable routes + dedicated sitemap preserved.`);
