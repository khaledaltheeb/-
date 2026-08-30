#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const files = {
  quickInfo: await readFile('lib/quick-info.ts', 'utf8'),
  visualModel: await readFile('lib/quick-info-visual.ts', 'utf8'),
  component: await readFile('components/quick-info-card.tsx', 'utf8'),
  componentCss: await readFile('components/quick-info-card.module.css', 'utf8'),
  detail: await readFile('app/quick-info/[slug]/page.tsx', 'utf8'),
  index: await readFile('app/quick-info/page.tsx', 'utf8'),
  middleware: await readFile('middleware.ts', 'utf8'),
  proxy: await readFile('lib/supabase/proxy.ts', 'utf8'),
  generator: await readFile('scripts/build-quick-info-cards.mjs', 'utf8'),
  seo: await readFile('lib/seo.ts', 'utf8'),
};

const errors = [];
const requireMatch = (name, text, pattern, message) => { if (!pattern.test(text)) errors.push(`${name}: ${message}`); };
const forbid = (name, text, pattern, message) => { if (pattern.test(text)) errors.push(`${name}: ${message}`); };

forbid('lib/quick-info.ts', files.quickInfo, /quickInfoCardPath|\/quick-info\/cards\//, 'on-site Quick Info must not depend on generated raster card files.');
requireMatch('lib/quick-info.ts', files.quickInfo, /\/quick-info\/og\/\$\{slug\}\.png/, 'static social/OpenGraph PNG path missing.');
requireMatch('visual model', files.visualModel, /quick-info-visuals\.json/, 'shared topic data model missing.');
requireMatch('component', files.component, /data-quick-info-visual/, 'semantic browser-rendered card marker missing.');
requireMatch('component', files.component, /dir="rtl"/, 'Quick Info card must explicitly declare RTL.');
requireMatch('component', files.component, /<h2/, 'Quick Info title must remain semantic text.');
requireMatch('component', files.component, /styles\.quickBadge/, 'Quick Info identity badge missing.');
requireMatch('component', files.component, /معلومات سريعة/, 'Quick Info text identity missing.');
forbid('component', files.component, /next\/image|<img|<Image|TopicGlyph|styles\.(?:visual|glyph|moon|personLarge|pill|chatOne|mindRing)/, 'Quick Info must not render baked images or expressive topic pictograms.');
requireMatch('component CSS', files.componentCss, /--qi-accent/, 'topic-aware color tokens missing.');
requireMatch('component CSS', files.componentCss, /@media\(max-width:760px\)/, 'mobile Quick Info contract missing.');
requireMatch('component CSS', files.componentCss, /\.quickBadge/, 'Quick Info badge styling missing.');
forbid('component CSS', files.componentCss, /\.(?:visual|glyph|moon|personLarge|personSmall|pill|chatOne|mindRing)\b/, 'expressive Quick Info illustration CSS must be absent.');
requireMatch('detail page', files.detail, /<QuickInfoCard[^>]*variant="hero"/, 'detail page must use the semantic HTML/CSS hero card.');
forbid('detail page', files.detail, /next\/image|quickInfoCardPath|<Image/, 'detail page must not render old generated raster cards.');
requireMatch('index page', files.index, /<QuickInfoCard/, 'Quick Info listing must use the semantic card.');
forbid('index page', files.index, /next\/image|featuredImageUrl|<Image/, 'Quick Info listing must not render raster thumbnails.');
forbid('middleware', files.middleware, /quick-info\/\(\?:cards\|og\)/, 'retired card route must not remain in middleware bypasses.');
requireMatch('middleware', files.middleware, /quick-info\/og/, 'social image route must bypass middleware.');
forbid('proxy', files.proxy, /'\/quick-info\/cards'/, 'retired card route must not remain in redirect exclusions.');
requireMatch('proxy', files.proxy, /'\/quick-info\/og'/, 'social image route must remain excluded from redirect resolution.');
forbid('generator', files.generator, /\/seo-card(?:\?|\/|$)|\/quick-info\/cards|CARD_DIR|LIST_WIDTH|LIST_HEIGHT|\.webp/, 'retired on-site raster generation must be absent.');
requireMatch('generator', files.generator, /social-images-manifest\.json/, 'generator must produce social-image output only.');
requireMatch('generator', files.generator, /Noto Sans Arabic/, 'Arabic social-image font contract missing.');
requireMatch('generator', files.generator, /rsvg-convert/, 'deterministic social-image rasterization missing.');
requireMatch('generator', files.generator, /direction="rtl"/, 'social SVG RTL direction missing.');
requireMatch('generator', files.generator, /text-anchor="end"/, 'social SVG right-edge anchoring missing.');
requireMatch('generator', files.generator, /select', 'slug,title,excerpt,canonical_url,schema_json'/, 'social generator must derive copy from page records.');
requireMatch('generator', files.generator, /limit', '500'/, 'social generator must use one bounded Supabase read.');
forbid('generator', files.generator, /cx="206" cy="240"|<g opacity="\.9">/, 'social images must not contain the retired decorative pictogram.');
requireMatch('seo', files.seo, /alt:\s*input\.title/, 'OpenGraph image alt must remain page-specific.');

if (errors.length) {
  console.error('Quick Info visual contract failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('Quick Info visual contract passed: text-first semantic RTL cards, no expressive pictograms, social-only rasterization, and page-specific OpenGraph alt text.');
