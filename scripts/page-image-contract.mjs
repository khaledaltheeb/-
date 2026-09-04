#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const route = await readFile('app/page-image/route.tsx', 'utf8');
const resolver = await readFile('lib/page-image.ts', 'utf8');
const component = await readFile('components/article-featured-image.tsx', 'utf8');
const middleware = await readFile('middleware.ts', 'utf8');
const templates = {
  capability: await readFile('components/capability-article-page.tsx', 'utf8'),
  comparison: await readFile('components/comparison-article-page.tsx', 'utf8'),
  family: await readFile('components/family-guide-article-page.tsx', 'utf8'),
  addiction: await readFile('components/addiction-article-page.tsx', 'utf8'),
  careGuide: await readFile('components/care-guide-page.tsx', 'utf8'),
  content: await readFile('app/content/[slug]/page.tsx', 'utf8'),
  encyclopedia: await readFile('app/encyclopedia/[slug]/page.tsx', 'utf8'),
  specialNeeds: await readFile('app/special-needs/[[...slug]]/page.tsx', 'utf8'),
};
const errors = [];

const requireMatch = (name, text, pattern, message) => {
  if (!pattern.test(text)) errors.push(`${name}: ${message}`);
};
const forbid = (name, text, pattern, message) => {
  if (pattern.test(text)) errors.push(`${name}: ${message}`);
};

requireMatch('Page image route', route, /width="1280" height="720" viewBox="0 0 1280 720"/, 'generic visible fallback must remain native 1280x720 16:9.');
requireMatch('Page image route', route, /fitSeoCardText/, 'shared runtime-safe text fitting must be used.');
requireMatch('Page image route', route, /assertSeoCardLayout/, 'hard safe-area assertions must remain active.');
requireMatch('Page image route', route, /const TITLE_MAX_WIDTH = 1040/, 'explicit title safe width missing.');
requireMatch('Page image route', route, /const TITLE_SAFE_TOP = 245/, 'title top safe boundary missing.');
requireMatch('Page image route', route, /const TITLE_SAFE_BOTTOM = 535/, 'title bottom safe boundary missing.');
requireMatch('Page image route', route, /maxLines:\s*3/, 'generic fallback title must remain capped at three lines.');
requireMatch('Page image route', route, /maxFontSize:\s*60/, 'generic fallback maximum title size missing.');
requireMatch('Page image route', route, /minFontSize:\s*38/, 'generic fallback minimum title size missing.');
requireMatch('Page image route', route, /Intl\.Segmenter\('ar', \{ granularity: 'grapheme' \}\)/, 'public query title clamping must preserve Arabic grapheme clusters.');
requireMatch('Page image route', route, /clipPath id="page-title-safe"/, 'final title clipping guard missing.');
requireMatch('Page image route', route, /text-anchor="start" direction="rtl" unicode-bidi="plaintext"/, 'RTL text must anchor from its right/start edge.');
forbid('Page image route', route, /text-anchor="end" direction="rtl"/, 'RTL end anchoring can overflow the right safe edge and is forbidden.');
requireMatch('Page image route', route, /normalizePageImageKind/, 'kind query must be restricted to the known visual taxonomy.');
requireMatch('Page image route', route, /pageImageKindLabel/, 'kind-specific visible context label missing.');
requireMatch('Page image route', route, /Content-Type': 'image\/svg\+xml; charset=utf-8'/, 'SVG MIME contract missing.');
requireMatch('Page image route', route, /X-Content-Type-Options': 'nosniff'/, 'MIME hardening header missing.');

requireMatch('Middleware', middleware, /seo-card\(\?:\/\|\$\)\|page-image\(\?:\/\|\$\)/, 'page-image must bypass auth/redirect middleware just like seo-card.');

requireMatch('Visible resolver', resolver, /if \(curated\)/, 'curated featured images must always win over generated fallback.');
requireMatch('Visible resolver', resolver, /kind === 'family-guide'[\s\S]*\/family-guide\/images\//, 'family-guide route-specific fallback missing.');
requireMatch('Visible resolver', resolver, /kind === 'addiction'[\s\S]*\/addiction\/images\//, 'addiction route-specific fallback missing.');
requireMatch('Visible resolver', resolver, /kind === 'capability'[\s\S]*\/capabilities\//, 'capability route-specific fallback missing.');
requireMatch('Visible resolver', resolver, /kind === 'comparison'[\s\S]*\/comparisons\//, 'comparison route-specific fallback missing.');
requireMatch('Visible resolver', resolver, /src: genericPageImagePath\(title, kind\)[\s\S]*width: 1280,[\s\S]*height: 720/, 'generic fallback must resolve to the 1280x720 page-image route.');
requireMatch('Visible resolver', resolver, /generatedFallback: false/, 'curated images must be distinguishable from generated fallback.');
requireMatch('Visible resolver', resolver, /صورة توضيحية من منصة روافد لصفحة/, 'generated fallback must expose meaningful Arabic alt text.');

requireMatch('Featured image component', component, /resolveVisiblePageImage/, 'shared resolver must drive the visible image component.');
requireMatch('Featured image component', component, /<figure/, 'visible fallback must render a semantic figure.');
requireMatch('Featured image component', component, /data-page-visual=\{visual\.generatedFallback \? 'generated-fallback' : 'curated'\}/, 'generated/curated state must remain observable for regression tests.');
requireMatch('Featured image component', component, /alt=\{visual\.alt\}/, 'resolved meaningful alt text must reach the rendered image.');
requireMatch('Featured image component', component, /width=\{visual\.width\}/, 'resolved image width must be explicit.');
requireMatch('Featured image component', component, /height=\{visual\.height\}/, 'resolved image height must be explicit.');
requireMatch('Featured image component', component, /unoptimized/, 'dynamic/public image routes must remain directly fetchable without Next image rewriting.');
forbid('Featured image component', component, /featuredImageUrl\s*\?\s*</, 'component must not hide itself when the stored featured image is missing.');

const expectedKinds = {
  capability: 'capability',
  comparison: 'comparison',
  family: 'family-guide',
  addiction: 'addiction',
  careGuide: 'care-guide',
  content: 'article',
  encyclopedia: 'encyclopedia',
  specialNeeds: 'special-needs',
};
for (const [name, source] of Object.entries(templates)) {
  requireMatch(`Template ${name}`, source, /ArticleFeaturedImage/, 'template must render the shared visible image component.');
  requireMatch(`Template ${name}`, source, /resolveVisiblePageImage/, 'template structured data must resolve the same visible image.');
  requireMatch(`Template ${name}`, source, new RegExp(`kind=["']${expectedKinds[name]}["']|kind:\\s*["']${expectedKinds[name]}["']`), `template must use page-image kind ${expectedKinds[name]}.`);
  forbid(`Template ${name}`, source, /featured_image_url\s*\?\s*<figure/, 'stored-image conditional must not hide the visible fallback.');
  forbid(`Template ${name}`, source, /image:\s*record\.featured_image_url\s*\|\|\s*undefined/, 'structured data must not lose its image when stored media is missing.');
}

for (const name of ['capability', 'comparison', 'family', 'addiction']) {
  requireMatch(`Route-specific template ${name}`, templates[name], /slug=\{|slug:\s*/, 'route-specific cover templates must pass a slug into the shared resolver/component.');
}

if (errors.length) {
  console.error('Visible page-image contract failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Visible page-image contract passed: all eight article templates always render a curated, route-specific, or generic 16:9 image; generic fallbacks are 1280x720, grapheme-safe, middleware-bypassed, and reflected in structured data.');
