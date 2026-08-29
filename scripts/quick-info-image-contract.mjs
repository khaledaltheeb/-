#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const files = {
  quickInfo: await readFile('lib/quick-info.ts', 'utf8'),
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

forbid('lib/quick-info.ts', files.quickInfo, /\/seo-card\?title=/, 'Quick Info must not use runtime seo-card generation.');
requireMatch('lib/quick-info.ts', files.quickInfo, /\/quick-info\/cards\/\$\{slug\}\.webp/, 'static WebP card path missing.');
requireMatch('lib/quick-info.ts', files.quickInfo, /\/quick-info\/og\/\$\{slug\}\.png/, 'static PNG OpenGraph path missing.');
requireMatch('detail page', files.detail, /width=\{1200\}\s+height=\{630\}/, 'featured image must use the native 1200x630 aspect ratio.');
requireMatch('detail page', files.detail, /dir="rtl"/, 'Quick Info detail page must explicitly declare RTL.');
requireMatch('index page', files.index, /width=\{640\}\s+height=\{336\}/, 'list thumbnails must preserve the 1200:630 ratio.');
requireMatch('index page', files.index, /loading="lazy"/, 'list thumbnails must lazy-load.');
requireMatch('middleware', files.middleware, /quick-info\/\(\?:cards\|og\)/, 'static Quick Info image routes must bypass middleware.');
requireMatch('proxy', files.proxy, /'\/quick-info\/cards'/, 'card route must be excluded from Supabase redirect resolution.');
requireMatch('proxy', files.proxy, /'\/quick-info\/og'/, 'OpenGraph route must be excluded from Supabase redirect resolution.');
requireMatch('proxy', files.proxy, /'\/seo-card'/, 'legacy seo-card route must be excluded from Supabase redirect resolution.');
requireMatch('generator', files.generator, /Noto Sans Arabic/, 'Arabic build font contract missing.');
requireMatch('generator', files.generator, /rsvg-convert/, 'librsvg rasterization contract missing.');
requireMatch('generator', files.generator, /direction="rtl"/, 'SVG RTL direction contract missing.');
requireMatch('generator', files.generator, /text-anchor="end"/, 'right-edge text anchoring contract missing.');
requireMatch('generator', files.generator, /#102f36/, 'high-contrast title color contract missing.');
requireMatch('generator', files.generator, /limit', '500'/, 'generator must fetch Quick Info records in one bounded read.');

if (errors.length) {
  console.error('Quick Info image contract failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Quick Info image contract passed: static assets, RTL shaping, right alignment, high contrast, middleware bypass, and bounded Supabase build read are enforced.');
