#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const files = {
  quickInfo: await readFile('lib/quick-info.ts', 'utf8'),
  component: await readFile('components/quick-info-card.tsx', 'utf8'),
  componentCss: await readFile('components/quick-info-card.module.css', 'utf8'),
  detail: await readFile('app/quick-info/[slug]/page.tsx', 'utf8'),
  imageCss: await readFile('app/quick-info/[slug]/quick-info-image.module.css', 'utf8'),
  imageSitemap: await readFile('app/sitemaps/quick-info.xml/route.ts', 'utf8'),
  middleware: await readFile('middleware.ts', 'utf8'),
  proxy: await readFile('lib/supabase/proxy.ts', 'utf8'),
  generator: await readFile('scripts/build-quick-info-cards.mjs', 'utf8'),
  textFit: await readFile('scripts/lib/arabic-image-text-fit.mjs', 'utf8'),
  seo: await readFile('lib/seo.ts', 'utf8'),
};

const errors = [];
const requireMatch = (name, text, pattern, message) => { if (!pattern.test(text)) errors.push(`${name}: ${message}`); };
const forbid = (name, text, pattern, message) => { if (pattern.test(text)) errors.push(`${name}: ${message}`); };

forbid('lib/quick-info.ts', files.quickInfo, /quickInfoCardPath|\/quick-info\/cards\//, 'retired generated card route must stay absent.');
requireMatch('lib/quick-info.ts', files.quickInfo, /\/quick-info\/og\/\$\{slug\}\.png/, 'static OG image path missing.');
requireMatch('lib/quick-info.ts', files.quickInfo, /\/quick-info\/discover\/\$\{slug\}\.png/, 'Discover image path missing.');
requireMatch('lib/quick-info.ts', files.quickInfo, /featured_image_url:\s*quickInfoDiscoverUrl\(safeSlug\)/, 'Discover image must remain the preferred featured image.');

requireMatch('component', files.component, /data-quick-info-visual/, 'semantic Quick Info card marker missing.');
requireMatch('component', files.component, /dir="rtl"/, 'Quick Info card must explicitly declare RTL.');
requireMatch('component', files.component, /<h2/, 'Quick Info title must remain semantic HTML text.');
requireMatch('component CSS', files.componentCss, /@media\(max-width:760px\)/, 'mobile Quick Info presentation contract missing.');

requireMatch('detail page', files.detail, /quickInfoOgPath/, 'visible OG card image must remain present.');
requireMatch('detail page', files.detail, /imageWidth:\s*1280[\s\S]*imageHeight:\s*720/, 'Discover metadata dimensions must remain 1280x720.');
requireMatch('detail page', files.detail, /width:\s*1280[\s\S]*height:\s*720/, 'Article ImageObject must expose the 1280x720 image.');
requireMatch('detail page', files.detail, /<Image[^>]*src=\{imagePath\}[^>]*width=\{1200\}[^>]*height=\{630\}/, 'visible card image must remain 1200x630.');
requireMatch('detail page', files.detail, /unoptimized/, 'generated PNG must remain directly discoverable.');
requireMatch('image presentation', files.imageCss, /aspect-ratio:1200\/630/, 'visible OG image aspect ratio must remain stable.');

requireMatch('image sitemap', files.imageSitemap, /xmlns:image="http:\/\/www\.google\.com\/schemas\/sitemap-image\/1\.1"/, 'image sitemap namespace missing.');
requireMatch('image sitemap', files.imageSitemap, /\/quick-info\/discover\/\$\{item\.routeSlug\}\.png/, 'Discover image must remain in the image sitemap.');
requireMatch('image sitemap', files.imageSitemap, /\/quick-info\/og\/\$\{item\.routeSlug\}\.png/, 'OG image must remain in the image sitemap.');
requireMatch('middleware', files.middleware, /quick-info\/\(\?:og\|discover\)/, 'generated image routes must bypass middleware.');
requireMatch('proxy', files.proxy, /'\/quick-info\/og'/, 'generated OG route must remain excluded from redirect resolution.');

forbid('generator', files.generator, /function\s+wrap\s*\([^)]*maxChars|next\.length\s*<=\s*maxChars/, 'character-count wrapping is forbidden for Arabic generated images.');
requireMatch('generator', files.generator, /fitArabicTextBlock/, 'generator must use shared pixel-measured text fitting.');
requireMatch('generator', files.generator, /assertTextBlockBounds/, 'generator must fail on safe-area overflow.');
requireMatch('generator', files.generator, /resolveArabicFontFile/, 'generator must resolve the actual Arabic font before rendering.');
requireMatch('generator', files.generator, /const CARD_TEXT_WIDTH = CARD_RIGHT - CARD_TEXT_LEFT/, 'card title must have an explicit horizontal safe width.');
requireMatch('generator', files.generator, /const DISCOVER_TEXT_WIDTH = DISCOVER_RIGHT - DISCOVER_TEXT_LEFT/, 'Discover title must have an explicit horizontal safe width.');
requireMatch('generator', files.generator, /safeTop:\s*CARD_PILL_BOTTOM \+ TITLE_CLEARANCE/, 'card title must protect the badge row.');
requireMatch('generator', files.generator, /safeTop:\s*DISCOVER_PILL_BOTTOM \+ TITLE_CLEARANCE/, 'Discover title must protect the badge row.');
requireMatch('generator', files.generator, /safeBottom:\s*CARD_TITLE_SAFE_BOTTOM/, 'card title lower safe boundary missing.');
requireMatch('generator', files.generator, /safeBottom:\s*DISCOVER_TITLE_SAFE_BOTTOM/, 'Discover title lower safe boundary missing.');
requireMatch('generator', files.generator, /clipPath id="safe-content"/, 'card SVG clipping guard missing.');
requireMatch('generator', files.generator, /clipPath id="discover-safe"/, 'Discover SVG clipping guard missing.');
requireMatch('generator', files.generator, /direction="rtl"/, 'generated SVG must preserve RTL direction.');
requireMatch('generator', files.generator, /text-anchor="start"/, 'generated Arabic text must anchor from the RTL start edge.');
requireMatch('generator', files.generator, /width="1280" height="720" viewBox="0 0 1280 720"/, 'Discover SVG must remain native 1280x720.');
requireMatch('generator', files.generator, /--width', '1280'[\s\S]*--height', '720'/, 'Discover rasterization must remain 1280x720.');
requireMatch('generator', files.generator, /discoverAspectRatio:\s*'16:9'/, 'Discover manifest aspect ratio missing.');
requireMatch('generator', files.generator, /social-images-manifest\.json/, 'image manifest must remain generated.');
requireMatch('generator', files.generator, /public', 'assets', 'brand', 'logo-mark\.svg/, 'official Rawafid logo asset must remain embedded.');
requireMatch('generator', files.generator, /Noto Sans Arabic/, 'Arabic font contract missing from generator.');
requireMatch('generator', files.generator, /rsvg-convert/, 'deterministic SVG rasterization missing.');
requireMatch('generator', files.generator, /convert', \['-version'\]/, 'ImageMagick runtime validation missing.');
requireMatch('generator', files.generator, /limit', '1000'/, 'Quick Info image build must cover the current corpus beyond the previous 500-row ceiling.');
requireMatch('generator', files.generator, /version:\s*11/, 'manifest version must record the pixel-fit migration.');

requireMatch('text fit', files.textFit, /measureArabicTextWidth/, 'shared Arabic width measurement missing.');
requireMatch('text fit', files.textFit, /fitArabicTextBlock/, 'shared Arabic auto-fit routine missing.');
requireMatch('text fit', files.textFit, /wrapTextByPixels/, 'pixel-based line wrapping missing.');
requireMatch('text fit', files.textFit, /splitOversizedTokenByPixels/, 'oversized single-token pixel splitting is required.');
requireMatch('text fit', files.textFit, /flatMap\(\(word\) => splitOversizedTokenByPixels/, 'pixel wrapper must apply oversized-token splitting.');
requireMatch('text fit', files.textFit, /Intl\.Segmenter\('ar', \{ granularity: 'grapheme' \}\)/, 'Arabic grapheme segmentation is required so combining marks stay attached to their base glyphs.');
requireMatch('text fit', files.textFit, /for \(const grapheme of graphemes\(clean\)\)/, 'oversized-token splitting must operate on grapheme clusters, not raw code points.');
requireMatch('text fit', files.textFit, /graphemes\(text\)\.slice\(0, -1\)/, 'ellipsis trimming must preserve grapheme clusters.');
requireMatch('text fit', files.textFit, /label:\$\{text\}/, 'ImageMagick text measurement must render the actual text.');
requireMatch('text fit', files.textFit, /widthCache = new Map\(\)/, 'measurement cache missing; build performance would regress.');
requireMatch('text fit', files.textFit, /for \(let fontSize = maxFontSize; fontSize >= minFontSize; fontSize -= 1\)/, 'auto-fit must progressively reduce font size.');
requireMatch('text fit', files.textFit, /ellipsizeToWidth/, 'last-resort visual ellipsis protection missing.');
requireMatch('text fit', files.textFit, /widest > maxWidth/, 'horizontal safe-bound assertion missing.');
requireMatch('text fit', files.textFit, /bottom > safeBottom/, 'vertical safe-bound assertion missing.');

requireMatch('seo', files.seo, /imageAlt\?: string \| null/, 'SEO metadata must accept page-specific image alt text.');
requireMatch('seo', files.seo, /imageWidth\?: number \| null/, 'SEO metadata must accept explicit image width.');
requireMatch('seo', files.seo, /imageHeight\?: number \| null/, 'SEO metadata must accept explicit image height.');
requireMatch('seo', files.seo, /'max-image-preview': 'large'/, 'Google large image previews must remain enabled.');

if (errors.length) {
  console.error('Quick Info visual contract failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Quick Info visual contract passed: Arabic titles are pixel-measured, auto-fitted, grapheme-safe, oversized-token safe, clipped, and hard-validated inside protected 1200x630 and 1280x720 safe areas without changing page routes or content.');
