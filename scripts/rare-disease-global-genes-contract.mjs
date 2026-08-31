import fs from 'node:fs';

const pages = fs.readFileSync('lib/rare-disease-global-genes-pages.ts','utf8');
const route = fs.readFileSync('app/evidence-guides/rare-disease/[[...slug]]/route.ts','utf8');
const sitemap = fs.readFileSync('app/sitemaps/rare-disease.xml/route.ts','utf8');
const sitemapIndex = fs.readFileSync('app/sitemap.xml/route.ts','utf8');

const urls = [
  'https://globalgenes.org/learn/',
  'https://globalgenes.org/rare-disease-patient-services/',
  'https://globalgenes.org/blog/becoming-an-empowered-patient-a-toolkit-for-the-undiagnosed/',
  'https://globalgenes.org/know-your-family-history/',
  'https://globalgenes.org/toolkit/rare-caregivers-guidebook/',
  'https://globalgenes.org/curriculum/',
  'https://globalgenes.org/blog/rare-disease-resources-for-individuals-caregivers-and-advocates/',
];
const slugs = ['undiagnosed-journey','new-diagnosis','genetic-testing-family-history','caregiver-support','mental-health-grief','research-clinical-trials','trusted-resource-navigation'];
const failures = [];

for (const url of urls) if (!pages.includes(url)) failures.push(`missing Global Genes source: ${url}`);
for (const slug of slugs) if (!pages.includes(`'${slug}'`)) failures.push(`missing rare-disease page: ${slug}`);
if (!pages.includes("'': hub")) failures.push('missing rare-disease hub');
if (!pages.includes('لا يشخّص مرضًا نادرًا')) failures.push('missing diagnosis safety boundary');
if (!pages.includes('لا تعني أن Global Genes راجعت أو اعتمدت أو صادقت')) failures.push('missing non-endorsement boundary');
const hasJordanBoundary = pages.includes('للأردن') || pages.includes('في الأردن') || pages.includes('الأردن');
if (!pages.includes('الولايات المتحدة') || !hasJordanBoundary) failures.push('missing geographic applicability boundary');
if (!route.includes('RARE_DISEASE_GLOBAL_GENES_PAGES')) failures.push('route registry missing');
if (!route.includes('x-rawafid-source')) failures.push('provenance header missing');
if (!sitemap.includes('RARE_DISEASE_GLOBAL_GENES_SLUGS')) failures.push('dedicated sitemap registry missing');
if (!sitemapIndex.includes("'/sitemaps/rare-disease.xml'")) failures.push('rare-disease sitemap not registered');

if (failures.length) {
  console.error('Global Genes rare disease contract failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(`Global Genes rare disease contract passed: 1 hub + ${slugs.length} guides, ${urls.length} canonical source links.`);
