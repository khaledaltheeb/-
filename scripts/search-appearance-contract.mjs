import fs from 'node:fs';

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

function requireAll(text, values, label) {
  for (const value of values) {
    if (!text.includes(value)) throw new Error(`${label}: missing ${value}`);
  }
}

const seo = read('lib/seo.ts');
const layout = read('app/layout.tsx');
const robots = read('app/robots.ts');
const staticSitemap = read('app/sitemaps/static.xml/route.ts');
const sitemapIndex = read('app/sitemap.xml/route.ts');
const header = read('components/site-header.tsx');
const footer = read('components/site-footer.tsx');

requireAll(seo, [
  "'@type': 'Organization'",
  "'@type': 'WebSite'",
  'alternateName: BRAND_SHORT',
  "'@type': 'ImageObject'",
  "publisher: { '@id': `${SITE_URL}/#organization` }",
], 'structured identity');

if (seo.includes("'@type': 'SearchAction'")) {
  throw new Error('structured identity: deprecated sitelinks SearchAction must not return');
}
if (seo.includes("'@type': 'AggregateRating'")) {
  throw new Error('structured identity: do not manufacture aggregate ratings for search appearance');
}

requireAll(layout, [
  "url: '/icons/rawafid-app.svg'",
  "url: '/pwa-icon-192'",
  "url: '/pwa-icon-180'",
  'applicationName: BRAND_NAME',
], 'root metadata');
if (/rawafid-app\.svg\?v=|pwa-icon-(?:180|192)\?v=/.test(layout)) {
  throw new Error('root metadata: search-facing icon URLs must remain stable');
}

requireAll(robots, [
  "sitemap: `${SITE_URL}/sitemap.xml`",
  "'Googlebot'",
  "'Bingbot'",
  "'OAI-SearchBot'",
  "'/search?'",
  "'/api/private/'",
], 'robots discovery');

requireAll(sitemapIndex, [
  "'/sitemaps/static.xml'",
  "'/sitemaps/taxonomy.xml'",
  "'/sitemaps/encyclopedia.xml?page=${page}'",
  "'/sitemaps/content.xml?page=${page}'",
], 'sitemap index');

requireAll(staticSitemap, [
  "path:'/sectors'",
  "path:'/sections'",
  "path:'/care-guides/'",
  "path:'/evidence-guides/'",
  "path:'/encyclopedia/'",
  "path:'/cognitive-lab'",
  "path:'/specialists'",
  "path:'/centers'",
], 'primary search hubs');

requireAll(header, [
  "href: '/sectors'",
  "href: '/sections'",
  "href: '/sectors/pediatric-oncology'",
  "href: '/care-guides/'",
  "href: '/evidence-guides/'",
], 'header authority links');

requireAll(footer, [
  "href: '/sectors'",
  "href: '/sections'",
  "href: '/sectors/pediatric-oncology'",
  "href: '/encyclopedia/'",
  "href: '/cognitive-lab'",
  "href: '/specialists'",
  "href: '/centers'",
  'data-nosnippet',
], 'footer authority links');

console.log('Search appearance contract: OK');
