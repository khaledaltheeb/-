#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const files = {
  quickInfo: await readFile('lib/quick-info.ts', 'utf8'),
  detail: await readFile('app/quick-info/[slug]/page.tsx', 'utf8'),
  imageSitemap: await readFile('app/sitemaps/quick-info.xml/route.ts', 'utf8'),
  generator: await readFile('scripts/build-quick-info-cards.mjs', 'utf8'),
  textFit: await readFile('scripts/lib/arabic-image-text-fit.mjs', 'utf8'),
  pageImage: await readFile('lib/page-image.ts', 'utf8'),
  pageImageRoute: await readFile('app/page-image/route.tsx', 'utf8'),
  seo: await readFile('lib/seo.ts', 'utf8'),
};

const errors = [];
const requireMatch = (name, text, pattern, message) => { if (!pattern.test(text)) errors.push(`${name}: ${message}`); };
const forbid = (name, text, pattern, message) => { if (pattern.test(text)) errors.push(`${name}: ${message}`); };

requireMatch('lib/quick-info.ts', files.quickInfo, /genericPageImagePath\(record\.title, 'quick-info'\)/, 'Quick Info preferred image must use the visual-first page-image route.');
requireMatch('lib/quick-info.ts', files.quickInfo, /featured_image_url:\s*`\$\{SITE_URL\}\$\{preferredImagePath\}`/, 'preferred image URL must be absolute for metadata and structured data.');
requireMatch('lib/quick-info.ts', files.quickInfo, /featured_image_alt:\s*`صورة توضيحية بصرية لمعلومة/, 'preferred image must expose descriptive Arabic alt text.');
forbid('lib/quick-info.ts', files.quickInfo, /featured_image_url:\s*quickInfoDiscoverUrl\(/, 'text-heavy static Discover card must never be the preferred image.');

requireMatch('Quick Info detail', files.detail, /imageWidth:\s*1280[\s\S]*imageHeight:\s*720/, 'preferred metadata image must remain 1280x720.');
requireMatch('Quick Info detail', files.detail, /width:\s*1280[\s\S]*height:\s*720/, 'Article ImageObject must expose the 1280x720 preferred image.');
requireMatch('Quick Info detail', files.detail, /quickInfoOgPath/, 'separate 1200x630 social card must remain available on the page.');

requireMatch('Image sitemap', files.imageSitemap, /genericPageImagePath\(item\.title, 'quick-info'\)/, 'image sitemap must point at the visual-first preferred image.');
forbid('Image sitemap', files.imageSitemap, /\/quick-info\/discover\//, 'text-heavy Discover card must not be advertised in the image sitemap.');
forbid('Image sitemap', files.imageSitemap, /\/quick-info\/og\//, 'social card must not be advertised as the preferred indexed image.');

requireMatch('Page image taxonomy', files.pageImage, /\| 'quick-info'/, 'Quick Info must have its own preferred visual kind.');
requireMatch('Page image taxonomy', files.pageImage, /case 'quick-info': return 'معلومات سريعة · روافد'/, 'Quick Info visual label missing.');
requireMatch('Page image route', files.pageImageRoute, /'quick-info': \{ accent:/, 'Quick Info visual palette missing.');
requireMatch('Page image route', files.pageImageRoute, /case 'quick-info':/, 'Quick Info topic illustration missing.');
requireMatch('Page image route', files.pageImageRoute, /maxLines:\s*2/, 'Google-preferred image title must remain limited to two lines.');
requireMatch('Page image route', files.pageImageRoute, /width="1280" height="720" viewBox="0 0 1280 720"/, 'preferred image must remain 1280x720 16:9.');

requireMatch('Social generator', files.generator, /width="1200" height="630" viewBox="0 0 1200 630"/, 'social card generation must remain available.');
requireMatch('Social generator', files.generator, /fitArabicTextBlock/, 'social card Arabic text fitting must remain pixel measured.');
requireMatch('Text fit', files.textFit, /Intl\.Segmenter\('ar', \{ granularity: 'grapheme' \}\)/, 'Arabic grapheme segmentation is required.');
requireMatch('SEO', files.seo, /'max-image-preview': 'large'/, 'Google large image previews must remain enabled.');

if (errors.length) {
  console.error('Quick Info Google-preferred image contract failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('Quick Info preferred-image contract passed: social cards remain separate while Google/Discover metadata, structured data and image sitemap use a visual-first 1280x720 preferred image with descriptive Arabic alt text.');
