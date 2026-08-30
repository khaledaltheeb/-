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
};

const errors = [];
function requireMatch(name, text, pattern, message) {
  if (!pattern.test(text)) errors.push(`${name}: ${message}`);
}
function forbid(name, text, pattern, message) {
  if (pattern.test(text)) errors.push(`${name}: ${message}`);
}

forbid('lib/quick-info.ts', files.quickInfo, /quickInfoCardPath|\/quick-info\/cards\//, 'on-site Quick Info must not depend on generated raster card files.');
requireMatch('lib/quick-info.ts', files.quickInfo, /\/quick-info\/og\/\$\{slug\}\.png/, 'static social/OpenGraph PNG path missing.');
requireMatch('visual model', files.visualModel, /quick-info-visuals\.json/, 'shared topic-visual data model missing.');
requireMatch('component', files.component, /data-quick-info-visual/, 'semantic browser-rendered visual component marker missing.');
requireMatch('component', files.component, /dir="rtl"/, 'Quick Info visual component must explicitly declare RTL.');
requireMatch('component', files.component, /<h2/, 'Quick Info title must remain browser-rendered semantic text.');
requireMatch('component', files.component, /description/, 'Quick Info browser card must render a page-derived description.');
forbid('component', files.component, /next\/image|<img|<Image/, 'Quick Info browser card must not use a baked raster image.');
requireMatch('component CSS', files.componentCss, /--qi-accent/, 'topic-aware CSS visual tokens missing.');
requireMatch('component CSS', files.componentCss, /@media\(max-width:760px\)/, 'mobile Quick Info visual contract missing.');
requireMatch('component CSS', files.componentCss, /\.visual,\.hero \.visual\{display:none\}/, 'mobile Quick Info must remove the top visual block so content starts at the platform identity.');
requireMatch('detail page', files.detail, /<QuickInfoCard[^>]*variant="hero"/, 'detail page must use the semantic HTML/CSS hero visual.');
forbid('detail page', files.detail, /next\/image|quickInfoCardPath|<Image/, 'detail page must not render the old generated raster card.');
requireMatch('detail page', files.detail, /dir="rtl"/, 'Quick Info detail page must explicitly declare RTL.');
requireMatch('index page', files.index, /<QuickInfoCard/, 'Quick Info listing must use the semantic HTML/CSS card.');
forbid('index page', files.index, /next\/image|featuredImageUrl|<Image/, 'Quick Info listing must not render old generated raster thumbnails.');
forbid('middleware', files.middleware, /quick-info\/\(\?:cards\|og\)/, 'retired Quick Info card route must not remain in middleware bypasses.');
requireMatch('middleware', files.middleware, /quick-info\/og/, 'social image route must bypass middleware.');
forbid('proxy', files.proxy, /'\/quick-info\/cards'/, 'retired card route must not remain in redirect exclusions.');
requireMatch('proxy', files.proxy, /'\/quick-info\/og'/, 'social image route must remain excluded from redirect resolution.');
forbid('generator', files.generator, /\/seo-card(?:\?|\/|$)|\/quick-info\/cards|CARD_DIR|LIST_WIDTH|LIST_HEIGHT|\.webp/, 'retired on-site raster-card generation must be absent.');
requireMatch('generator', files.generator, /social-images-manifest\.json/, 'generator must explicitly produce social-image output only.');
requireMatch('generator', files.generator, /Noto Sans Arabic/, 'Arabic social-image font contract missing.');
requireMatch('generator', files.generator, /rsvg-convert/, 'deterministic social-image rasterization contract missing.');
requireMatch('generator', files.generator, /direction="rtl"/, 'social SVG RTL direction contract missing.');
requireMatch('generator', files.generator, /text-anchor="end"/, 'social SVG right-edge text anchoring contract missing.');
requireMatch('generator', files.generator, /select', 'slug,title,excerpt,canonical_url,schema_json'/, 'social generator must derive title and description from the page record.');
requireMatch('generator', files.generator, /limit', '500'/, 'social generator must use one bounded Supabase read.');

if (errors.length) {
  console.error('Quick Info visual contract failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Quick Info visual contract passed: on-site visuals are semantic RTL HTML/CSS; mobile starts at content without the top visual block; rasterization is isolated to static social/OpenGraph images.');
