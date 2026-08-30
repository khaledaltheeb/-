#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const files = {
  quickInfo: await readFile('lib/quick-info.ts', 'utf8'),
  visualModel: await readFile('lib/quick-info-visual.ts', 'utf8'),
  component: await readFile('components/quick-info-card.tsx', 'utf8'),
  componentCss: await readFile('components/quick-info-card.module.css', 'utf8'),
  detail: await readFile('app/quick-info/[slug]/page.tsx', 'utf8'),
  imageCss: await readFile('app/quick-info/[slug]/quick-info-image.module.css', 'utf8'),
  index: await readFile('app/quick-info/page.tsx', 'utf8'),
  imageSitemap: await readFile('app/sitemaps/quick-info.xml/route.ts', 'utf8'),
  middleware: await readFile('middleware.ts', 'utf8'),
  proxy: await readFile('lib/supabase/proxy.ts', 'utf8'),
  generator: await readFile('scripts/build-quick-info-cards.mjs', 'utf8'),
  seo: await readFile('lib/seo.ts', 'utf8'),
};

const errors = [];
const requireMatch = (name, text, pattern, message) => { if (!pattern.test(text)) errors.push(`${name}: ${message}`); };
const forbid = (name, text, pattern, message) => { if (pattern.test(text)) errors.push(`${name}: ${message}`); };

forbid('lib/quick-info.ts', files.quickInfo, /quickInfoCardPath|\/quick-info\/cards\//, 'on-site Quick Info must not depend on retired generated raster card files.');
requireMatch('lib/quick-info.ts', files.quickInfo, /\/quick-info\/og\/\$\{slug\}\.png/, 'static Quick Info card PNG path missing.');
requireMatch('lib/quick-info.ts', files.quickInfo, /\/quick-info\/discover\/\$\{slug\}\.png/, 'dedicated Quick Info Discover PNG path missing.');
requireMatch('lib/quick-info.ts', files.quickInfo, /featured_image_url:\s*quickInfoDiscoverUrl\(safeSlug\)/, 'Quick Info SEO image must prefer the dedicated Discover image.');
requireMatch('visual model', files.visualModel, /quick-info-visuals\.json/, 'shared topic data model missing.');
requireMatch('component', files.component, /data-quick-info-visual/, 'semantic browser-rendered card marker missing.');
requireMatch('component', files.component, /dir="rtl"/, 'Quick Info card must explicitly declare RTL.');
requireMatch('component', files.component, /<h2/, 'Quick Info title must remain semantic text.');
requireMatch('component', files.component, /styles\.quickBadge/, 'Quick Info identity badge missing.');
requireMatch('component', files.component, /معلومات سريعة/, 'Quick Info text identity missing.');
requireMatch('component', files.component, /import Image from 'next\/image'/, 'official Rawafid logo must use optimized Next Image.');
requireMatch('component', files.component, /<Image[^>]*src="\/assets\/brand\/logo-mark\.svg"[^>]*alt=""/, 'official Rawafid logo must replace the temporary letter mark.');
forbid('component', files.component, /TopicGlyph|styles\.(?:visual|glyph|moon|personLarge|pill|chatOne|mindRing)/, 'Quick Info HTML card must remain text-first and free of expressive topic pictograms.');
forbid('component', files.component, />\s*ر\s*</, 'temporary Rawafid letter mark must not return.');
requireMatch('component CSS', files.componentCss, /--qi-accent/, 'topic-aware color tokens missing.');
requireMatch('component CSS', files.componentCss, /@media\(max-width:760px\)/, 'mobile Quick Info contract missing.');
requireMatch('component CSS', files.componentCss, /\.quickBadge/, 'Quick Info badge styling missing.');
requireMatch('component CSS', files.componentCss, /\.brandMark img/, 'official logo sizing contract missing.');
forbid('component CSS', files.componentCss, /\.(?:visual|glyph|moon|personLarge|personSmall|pill|chatOne|mindRing)\b/, 'expressive Quick Info illustration CSS must be absent.');
requireMatch('detail page', files.detail, /<QuickInfoCard[^>]*variant="hero"/, 'detail page must preserve the semantic HTML/CSS hero card.');
requireMatch('detail page', files.detail, /quickInfoOgPath/, 'detail page must keep the current card image as the visible secondary image.');
requireMatch('detail page', files.detail, /data-quick-info-indexable-image/, 'detail page must expose the existing real indexable card image.');
requireMatch('detail page', files.detail, /imageWidth:\s*1280[\s\S]*imageHeight:\s*720/, 'Quick Info social metadata must declare the 1280x720 Discover dimensions.');
requireMatch('detail page', files.detail, /width:\s*1280[\s\S]*height:\s*720/, 'Article ImageObject must expose the 1280x720 Discover image.');
requireMatch('detail page', files.detail, /thumbnailUrl:\s*imagePath\s*\?\s*`\$\{SITE_URL\}\$\{imagePath\}`/, 'Article schema must retain the visible card image as a thumbnail.');
requireMatch('detail page', files.detail, /<Image[^>]*src=\{imagePath\}[^>]*alt=\{imageAlt\}[^>]*width=\{1200\}[^>]*height=\{630\}/, 'visible Quick Info card image dimensions must stay 1200x630.');
requireMatch('detail page', files.detail, /unoptimized/, 'generated card PNG URL must remain directly discoverable rather than replaced by an optimizer URL.');
forbid('detail page', files.detail, /quickInfoCardPath/, 'detail page must not reintroduce the retired raster-card rendering path.');
requireMatch('image presentation', files.imageCss, /width:min\(640px,100%\)/, 'indexable card image must remain visually secondary and responsive.');
requireMatch('image presentation', files.imageCss, /aspect-ratio:1200\/630/, 'visible card image aspect ratio must remain stable.');
requireMatch('index page', files.index, /<QuickInfoCard/, 'Quick Info listing must use the semantic card.');
forbid('index page', files.index, /featuredImageUrl/, 'Quick Info listing must not render duplicate raster thumbnails.');
requireMatch('image sitemap', files.imageSitemap, /xmlns:image="http:\/\/www\.google\.com\/schemas\/sitemap-image\/1\.1"/, 'Quick Info sitemap must declare the Google image namespace.');
requireMatch('image sitemap', files.imageSitemap, /\/quick-info\/discover\/\$\{item\.routeSlug\}\.png/, 'Quick Info sitemap must list the dedicated Discover image.');
requireMatch('image sitemap', files.imageSitemap, /\/quick-info\/og\/\$\{item\.routeSlug\}\.png/, 'Quick Info sitemap must retain the card image.');
requireMatch('middleware', files.middleware, /quick-info\/\(\?:og\|discover\)/, 'Quick Info generated image routes must bypass middleware.');
forbid('proxy', files.proxy, /'\/quick-info\/cards'/, 'retired card route must not remain in redirect exclusions.');
requireMatch('proxy', files.proxy, /'\/quick-info\/og'/, 'generated Quick Info card route must remain excluded from redirect resolution.');
forbid('generator', files.generator, /\/seo-card(?:\?|\/|$)|\/quick-info\/cards|CARD_DIR|LIST_WIDTH|LIST_HEIGHT|\.webp/, 'retired on-site raster generation must be absent.');
requireMatch('generator', files.generator, /DISCOVER_DIR/, 'generator must create a dedicated Discover image directory.');
requireMatch('generator', files.generator, /width="1280" height="720" viewBox="0 0 1280 720"/, 'Discover SVG must be native 1280x720 16:9.');
requireMatch('generator', files.generator, /--width', '1280'[\s\S]*--height', '720'/, 'Discover PNG rasterization must remain 1280x720.');
requireMatch('generator', files.generator, /discoverAspectRatio:\s*'16:9'/, 'Discover manifest must declare the 16:9 contract.');
requireMatch('generator', files.generator, /discoverImage:\s*`\/quick-info\/discover\/\$\{item\.slug\}\.png`/, 'Discover manifest URL missing.');
requireMatch('generator', files.generator, /discoverWidth:\s*1280[\s\S]*discoverHeight:\s*720/, 'Discover manifest dimensions missing.');
requireMatch('generator', files.generator, /social-images-manifest\.json/, 'generator must produce an image manifest.');
requireMatch('generator', files.generator, /public', 'assets', 'brand', 'logo-mark\.svg/, 'generated images must use the official Rawafid logo asset.');
requireMatch('generator', files.generator, /LOGO_DATA/, 'official logo must be embedded deterministically in generated PNG cards.');
requireMatch('generator', files.generator, /معلومات سريعة/, 'generated images must preserve the approved Quick Info identity.');
requireMatch('generator', files.generator, /alt: imageAlt\(item\)/, 'card image manifest must carry descriptive alt text.');
requireMatch('generator', files.generator, /discoverAlt:\s*discoverAlt\(item\)/, 'Discover image manifest must carry descriptive alt text.');
requireMatch('generator', files.generator, /width: 1200,[\s\S]*height: 630/, 'card image manifest dimensions missing.');
requireMatch('generator', files.generator, /Noto Sans Arabic/, 'Arabic image font contract missing.');
requireMatch('generator', files.generator, /rsvg-convert/, 'deterministic PNG rasterization missing.');
requireMatch('generator', files.generator, /direction="rtl"/, 'generated SVG RTL direction missing.');
requireMatch('generator', files.generator, /text-anchor="start"/, 'generated SVG Arabic text must anchor from the RTL start edge.');
requireMatch('generator', files.generator, /clipPath id="safe-content"/, 'card SVG must clip content to a safe inner frame.');
requireMatch('generator', files.generator, /clipPath id="discover-safe"/, 'Discover SVG must clip content to a safe inner frame.');
requireMatch('generator', files.generator, /const CARD_RIGHT = 1082/, 'card image must keep a deterministic right content boundary.');
requireMatch('generator', files.generator, /const EXCERPT_FONT_SIZE = 24/, 'card supporting text must remain legible at mobile preview size.');
requireMatch('generator', files.generator, /const SITE_URL_LABEL = 'https:\/\/healthrenewal\.org'/, 'generated images must print the canonical HTTPS site URL.');
requireMatch('generator', files.generator, /const CARD_PILL_BOTTOM = 222/, 'card badge-row lower boundary must remain explicit for collision prevention.');
requireMatch('generator', files.generator, /const DISCOVER_PILL_BOTTOM = 248/, 'Discover badge-row lower boundary must remain explicit for collision prevention.');
requireMatch('generator', files.generator, /const TITLE_CLEARANCE = 10/, 'generated Arabic titles must preserve a minimum protected vertical gap below badges.');
requireMatch('generator', files.generator, /function assertTitleClearance\([\s\S]*titleStart - titleFontSize < pillBottom \+ TITLE_CLEARANCE/, 'generator must fail rather than emit a title that collides with the badge row.');
requireMatch('generator', files.generator, /cardHasThreeLines \? Math\.min\(baseTitleSize, 40\)/, 'three-line card titles must use the compact protected font-size ceiling.');
requireMatch('generator', files.generator, /cardHasThreeLines \? 274/, 'three-line card titles must start below the protected badge area.');
requireMatch('generator', files.generator, /discoverHasThreeLines \? Math\.min\(baseTitleSize, 48\)/, 'three-line Discover titles must use the compact protected font-size ceiling.');
requireMatch('generator', files.generator, /discoverHasThreeLines \? 306/, 'three-line Discover titles must start below the protected badge area.');
forbid('generator', files.generator, />healthrenewal\.org<\/text>/, 'bare non-HTTPS site label must not return.');
forbid('generator', files.generator, />ر<\/text>/, 'temporary letter logo must not appear in generated images.');
requireMatch('seo', files.seo, /imageAlt\?: string \| null/, 'SEO metadata must accept page-specific image alt text.');
requireMatch('seo', files.seo, /imageWidth\?: number \| null/, 'SEO metadata must accept explicit social image width.');
requireMatch('seo', files.seo, /imageHeight\?: number \| null/, 'SEO metadata must accept explicit social image height.');
requireMatch('seo', files.seo, /alt:\s*imageAlt/, 'OpenGraph image alt must use the page-specific value.');
requireMatch('seo', files.seo, /'max-image-preview': 'large'/, 'Googlebot must allow large image previews for Discover eligibility.');

if (errors.length) {
  console.error('Quick Info visual contract failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('Quick Info visual contract passed: the HTML card and 1200x630 visible image are preserved, every approved page receives a dedicated 1280x720 Discover image, and long three-line Arabic titles are protected by deterministic badge-clearance guards before rasterization.');
