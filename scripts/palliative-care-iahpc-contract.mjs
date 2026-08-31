import fs from 'node:fs';

const sourcePath = 'lib/palliative-care-iahpc-pages.ts';
const routePath = 'app/evidence-guides/palliative-care/[[...slug]]/route.ts';
const sitemapPath = 'app/sitemaps/palliative-care.xml/route.ts';
const sitemapIndexPath = 'app/sitemap.xml/route.ts';

const source = fs.readFileSync(sourcePath, 'utf8');
const route = fs.readFileSync(routePath, 'utf8');
const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const sitemapIndex = fs.readFileSync(sitemapIndexPath, 'utf8');

const requiredSources = [
  'https://iahpc.org/what-we-do/research/consensus-based-definition-of-palliative-care/',
  'https://iahpc.org/what-we-do/research/essential-and-expanded-palliative-care-packages-for-adults-and-children/',
  'https://iahpc.org/resources/publications/manual-on-the-use-of-essential-palliative-care-medicines-for-adults/',
  'https://iahpc.org/resources/publications/getting-started/',
];

const requiredSlugs = [
  'what-is-palliative-care',
  'serious-health-related-suffering',
  'essential-care-packages',
  'family-caregiver-support',
  'medicines-safety',
  'service-development',
  'questions-for-care-team',
];

const failures = [];

for (const url of requiredSources) {
  if (!source.includes(url)) failures.push(`missing IAHPC source: ${url}`);
}

for (const slug of requiredSlugs) {
  if (!source.includes(`'${slug}'`)) failures.push(`missing page slug: ${slug}`);
  if (!source.includes(`/evidence-guides/palliative-care/`)) failures.push('missing palliative-care canonical base');
}

if (!source.includes("'': hub")) failures.push('missing palliative-care hub');
if (!source.includes('ليس ترجمة رسمية') && !source.includes('ليست ترجمة رسمية')) failures.push('missing independent-content disclaimer');
if (!source.includes('لا جرعات')) failures.push('missing medication no-dose safety boundary');
if (!source.includes('لا يقدم تشخيصًا أو وصفة أو جرعات أو خطة علاج فردية')) failures.push('missing medical safety disclaimer');
if (!route.includes("PALLIATIVE_CARE_IAHPC_PAGES")) failures.push('route is not wired to page registry');
if (!route.includes("x-rawafid-source")) failures.push('route source provenance header missing');
if (!sitemap.includes('PALLIATIVE_CARE_IAHPC_SLUGS')) failures.push('dedicated sitemap is not wired to page registry');
if (!sitemapIndex.includes("'/sitemaps/palliative-care.xml'")) failures.push('palliative-care sitemap missing from sitemap index');

if (failures.length) {
  console.error('Palliative care IAHPC contract failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Palliative care IAHPC contract passed: 1 hub + ${requiredSlugs.length} guides, ${requiredSources.length} canonical IAHPC sources.`);
