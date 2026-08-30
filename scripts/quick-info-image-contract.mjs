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
requireMatch('lib/quick-info.ts', files.quickInfo, /\/quick-info\/og\/\$\{slug\}\.png/, 'static Quick Info PNG path missing.');
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
requireMatch('detail page', files.detail, /quickInfoOgPath/, 'detail page must derive the visible image from the local static PNG path.');
requireMatch('detail page', files.detail, /data-quick-info-indexable-image/, 'detail page must expose a real indexable image without replacing the HTML card.');
requireMatch('detail page', files.detail, /import Image from 'next\/image'/, 'detail image must use Next Image.');
requireMatch('detail page', files.detail, /<Image[^>]*src=\{imagePath\}[^>]*alt=\{imageAlt\}[^>]*width=\{1200\}[^>]*height=\{630\}/, 'real Quick Info image must use the direct local PNG, page-specific alt text, and stable dimensions.');
requireMatch('detail page', files.detail, /unoptimized/, 'generated PNG URL must remain directly discoverable rather than replaced by an optimizer URL.');
requireMatch('detail page', files.detail, /'@type': 'ImageObject'/, 'Article schema must expose the primary image as ImageObject.');
requireMatch('detail page', files.detail, /width:\s*1200[\s\S]*height:\s*630/, 'ImageObject dimensions missing.');
forbid('detail page', files.detail, /quickInfoCardPath/, 'detail page must not reintroduce the retired raster-card rendering path.');
requireMatch('image presentation', files.imageCss, /width:min\(640px,100%\)/, 'indexable image must remain visually secondary and responsive.');
requireMatch('image presentation', files.imageCss, /aspect-ratio:1200\/630/, 'indexable image aspect ratio must be stable.');
requireMatch('index page', files.index, /<QuickInfoCard/, 'Quick Info listing must use the semantic card.');
forbid('index page', files.index, /featuredImageUrl/, 'Quick Info listing must not render duplicate raster thumbnails.');
requireMatch('image sitemap', files.imageSitemap, /xmlns:image="http:\/\/www\.google\.com\/schemas\/sitemap-image\/1\.1"/, 'Quick Info sitemap must declare the Google image namespace.');
requireMatch('image sitemap', files.imageSitemap, /<image:image><image:loc>/, 'Quick Info sitemap must associate each canonical page with its PNG image.');
requireMatch('image sitemap', files.imageSitemap, /\/quick-info\/og\/\$\{item\.routeSlug\}\.png/, 'Quick Info sitemap image path must match generated assets.');
forbid('middleware', files.middleware, /quick-info\/\(\?:cards\|og\)/, 'retired card route must not remain in middleware bypasses.');
requireMatch('middleware', files.middleware, /quick-info\/og/, 'generated Quick Info image route must bypass middleware.');
forbid('proxy', files.proxy, /'\/quick-info\/cards'/, 'retired card route must not remain in redirect exclusions.');
requireMatch('proxy', files.proxy, /'\/quick-info\/og'/, 'generated Quick Info image route must remain excluded from redirect resolution.');
forbid('generator', files.generator, /\/seo-card(?:\?|\/|$)|\/quick-info\/cards|CARD_DIR|LIST_WIDTH|LIST_HEIGHT|\.webp/, 'retired on-site raster generation must be absent.');
requireMatch('generator', files.generator, /social-images-manifest\.json/, 'generator must produce an image manifest.');
requireMatch('generator', files.generator, /public', 'assets', 'brand', 'logo-mark\.svg/, 'generated images must use the official Rawafid logo asset.');
requireMatch('generator', files.generator, /LOGO_DATA/, 'official logo must be embedded deterministically in generated PNG cards.');
requireMatch('generator', files.generator, /معلومات سريعة/, 'generated image must preserve the approved Quick Info badge.');
requireMatch('generator', files.generator, /alt: imageAlt\(item\)/, 'generated image manifest must carry descriptive alt text.');
requireMatch('generator', files.generator, /width: 1200,[\s\S]*height: 630/, 'generated image manifest dimensions missing.');
requireMatch('generator', files.generator, /Noto Sans Arabic/, 'Arabic image font contract missing.');
requireMatch('generator', files.generator, /rsvg-convert/, 'deterministic PNG rasterization missing.');
requireMatch('generator', files.generator, /direction="rtl"/, 'generated SVG RTL direction missing.');
requireMatch('generator', files.generator, /text-anchor="start"/, 'generated SVG Arabic text must anchor from the RTL start edge so text flows leftward inside the safe frame.');
requireMatch('generator', files.generator, /clipPath id="safe-content"/, 'generated SVG must clip all content to a safe inner frame.');
requireMatch('generator', files.generator, /const CARD_RIGHT = 1082/, 'generated image must keep a deterministic right content boundary.');
forbid('generator', files.generator, />ر<\/text>/, 'temporary letter logo must not appear in generated images.');
requireMatch('seo', files.seo, /imageAlt\?: string \| null/, 'SEO metadata must accept page-specific image alt text.');
requireMatch('seo', files.seo, /alt:\s*imageAlt/, 'OpenGraph image alt must use the page-specific value.');

if (errors.length) {
  console.error('Quick Info visual contract failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('Quick Info visual contract passed: semantic HTML cards are preserved, official Rawafid branding is used, generated Arabic PNG text stays inside a deterministic RTL-safe frame, each page exposes a real image with alt and ImageObject metadata, and Quick Info sitemap carries image URLs.');
