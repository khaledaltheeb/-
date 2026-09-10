import { readFile } from 'node:fs/promises';

const [config, contentSitemap, encyclopediaSitemap] = await Promise.all([
  readFile('next.config.ts', 'utf8'),
  readFile('app/sitemaps/content.xml/route.ts', 'utf8'),
  readFile('app/sitemaps/encyclopedia.xml/route.ts', 'utf8'),
]);

const requiredRedirects = [
  ['/encyclopedia/fragile-x-syndrome-education', '/content/fragile-x-school-iep-inclusion'],
  ['/encyclopedia/fragile-x-syndrome-education/', '/content/fragile-x-school-iep-inclusion'],
  ['/encyclopedia/cluttering-communication-disorder', '/encyclopedia/cluttering/'],
  ['/encyclopedia/cluttering-communication-disorder/', '/encyclopedia/cluttering/'],
  ['/content/cluttering-fluency-disorder', '/encyclopedia/cluttering/'],
  ['/content/cluttering-fluency-disorder/', '/encyclopedia/cluttering/'],
  ['/content/special-ed-encyclopedia-childhood-apraxia-of-speech', '/encyclopedia/childhood-apraxia-speech/'],
  ['/content/special-ed-encyclopedia-childhood-apraxia-of-speech/', '/encyclopedia/childhood-apraxia-speech/'],
  ['/special-needs/communication/childhood-apraxia-of-speech', '/encyclopedia/childhood-apraxia-speech/'],
  ['/special-needs/communication/childhood-apraxia-of-speech/', '/encyclopedia/childhood-apraxia-speech/'],
  ['/provider-assessment-demo/conditions/aac', '/care-guides/aac/assessment-access-feature-matching/'],
  ['/provider-assessment-demo/conditions/aac/', '/care-guides/aac/assessment-access-feature-matching/'],
];

const normalizePath = (path) => path === '/' ? path : path.replace(/\/+$/, '');
const failures = [];

for (const [source, destination] of requiredRedirects) {
  const sourceMarker = `source: '${source}'`;
  const destinationMarker = `destination: '${destination}'`;
  const sourceIndex = config.indexOf(sourceMarker);
  if (sourceIndex === -1) {
    failures.push(`missing redirect source ${source}`);
    continue;
  }

  const block = config.slice(sourceIndex, sourceIndex + 320);
  if (!block.includes(destinationMarker)) failures.push(`${source} does not point to ${destination}`);
  if (!block.includes('permanent: true')) failures.push(`${source} is not permanent`);

  // All config-owned redirect sources must be represented in the content sitemap's
  // explicit exclusion set, even if no matching DB record exists today. This makes
  // future publication/robots changes safe by construction.
  const normalizedSource = normalizePath(source);
  if (!contentSitemap.includes(`'${normalizedSource}'`)) {
    failures.push(`${normalizedSource} is not protected by the content sitemap redirect-source exclusion set`);
  }

  // Encyclopedia redirects are owned by a dedicated sitemap, so its slug filter
  // must also exclude config-owned aliases in addition to DB-owned redirects.
  if (normalizedSource.startsWith('/encyclopedia/')) {
    const slug = normalizedSource.slice('/encyclopedia/'.length);
    if (!encyclopediaSitemap.includes(`'${slug}'`)) {
      failures.push(`${normalizedSource} is not protected by the encyclopedia sitemap redirect-source filter`);
    }
  }
}

if (failures.length) {
  console.error('Canonical consolidation and sitemap-ownership contract failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Canonical consolidation and sitemap-ownership contract passed for ${requiredRedirects.length} protected route variants.`);
