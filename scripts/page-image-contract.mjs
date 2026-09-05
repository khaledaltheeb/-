#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const route = await readFile('app/page-image/route.tsx', 'utf8');
const resolver = await readFile('lib/page-image.ts', 'utf8');
const component = await readFile('components/article-featured-image.tsx', 'utf8');
const middleware = await readFile('middleware.ts', 'utf8');
const browserRegression = await readFile('scripts/page-image-browser-regression.mjs', 'utf8');
const qualityWorkflow = await readFile('.github/workflows/quality.yml', 'utf8');
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
const requireMatch = (name, text, pattern, message) => { if (!pattern.test(text)) errors.push(`${name}: ${message}`); };
const forbid = (name, text, pattern, message) => { if (pattern.test(text)) errors.push(`${name}: ${message}`); };

requireMatch('Page image route', route, /width="1280" height="720" viewBox="0 0 1280 720"/, 'preferred fallback must remain native 1280x720 16:9.');
requireMatch('Page image route', route, /const TITLE_MAX_WIDTH = 560/, 'Google-preferred title region must stay narrow enough to preserve a dominant visual area.');
requireMatch('Page image route', route, /maxLines:\s*2/, 'preferred image title must stay at one or two lines.');
requireMatch('Page image route', route, /maxFontSize:\s*50/, 'preferred image title maximum size changed unexpectedly.');
requireMatch('Page image route', route, /minFontSize:\s*36/, 'preferred image title minimum size changed unexpectedly.');
requireMatch('Page image route', route, /subjectIllustration\(kind, palette\.accent, palette\.soft\)/, 'topic-specific visual illustration must remain dominant in generated fallback.');
requireMatch('Page image route', route, /x="92" y="92" width="520" height="536"/, 'visual-first subject panel must remain present.');
requireMatch('Page image route', route, /clipPath id="page-title-safe"/, 'title clipping guard missing.');
requireMatch('Page image route', route, /fitSeoCardText/, 'runtime-safe text fitting must remain active.');
requireMatch('Page image route', route, /assertSeoCardLayout/, 'hard safe-area assertion must remain active.');
requireMatch('Page image route', route, /Intl\.Segmenter\('ar', \{ granularity: 'grapheme' \}\)/, 'Arabic grapheme-safe clamping is required.');
requireMatch('Page image route', route, /text-anchor="start" direction="rtl" unicode-bidi="plaintext"/, 'RTL anchoring contract missing.');
forbid('Page image route', route, /text-anchor="end" direction="rtl"/, 'RTL end anchoring can overflow and is forbidden.');
requireMatch('Page image route', route, /Content-Type': 'image\/svg\+xml; charset=utf-8'/, 'supported image MIME contract missing.');
requireMatch('Page image route', route, /X-Content-Type-Options': 'nosniff'/, 'MIME hardening missing.');

requireMatch('Middleware', middleware, /seo-card\(\?:\/\|\$\)\|page-image\(\?:\/\|\$\)/, 'page-image must bypass auth/redirect middleware.');
requireMatch('Visible resolver', resolver, /if \(curated\)/, 'curated images must always win over generated fallback.');
requireMatch('Visible resolver', resolver, /src: genericPageImagePath\(title, kind\)[\s\S]*width: 1280,[\s\S]*height: 720/, 'generic preferred image must resolve to 1280x720.');
requireMatch('Visible resolver', resolver, /صورة توضيحية من منصة روافد لصفحة/, 'generated fallback must expose meaningful Arabic alt text.');
requireMatch('Featured image component', component, /<figure/, 'preferred image must remain visible semantic content.');
requireMatch('Featured image component', component, /alt=\{visual\.alt\}/, 'descriptive alt text must reach the image element.');
requireMatch('Featured image component', component, /width=\{visual\.width\}/, 'explicit image width missing.');
requireMatch('Featured image component', component, /height=\{visual\.height\}/, 'explicit image height missing.');

requireMatch('Browser regression', browserRegression, /TITLE_SAFE = \{ left: 600, right: 1160, top: 280, bottom: 455 \}/, 'visual-first title safe area changed unexpectedly.');
requireMatch('Browser regression', browserRegression, /result\.titleBoxes\.length > 2/, 'browser gate must fail when preferred image title exceeds two lines.');
requireMatch('Browser regression', browserRegression, /hasSubjectPanel/, 'browser gate must verify the dominant visual panel.');
requireMatch('Browser regression', browserRegression, /getBBox\(\)/, 'real rendered text bounds must remain browser-measured.');

requireMatch('Quality workflow', qualityWorkflow, /Page image 1280x720 safe-area browser regression/, 'page-image browser regression must remain blocking in Quality.');
requireMatch('Quality workflow', qualityWorkflow, /VISUAL_CHROME_PATH="\$CHROME_BIN" node scripts\/page-image-browser-regression\.mjs/, 'Quality must execute the real-Chrome page-image regression.');
requireMatch('Quality workflow', qualityWorkflow, /Full sitemap SEO gate[\s\S]*timeout-minutes:\s*30/, 'Full Sitemap SEO timeout contract must be preserved.');
requireMatch('Quality workflow', qualityWorkflow, /Rich results and discovery gate \(advisory\)[\s\S]*timeout-minutes:\s*20/, 'Rich Discovery timeout contract must be preserved.');

const expectedKinds = { capability: 'capability', comparison: 'comparison', family: 'family-guide', addiction: 'addiction', careGuide: 'care-guide', content: 'article', encyclopedia: 'encyclopedia', specialNeeds: 'special-needs' };
for (const [name, source] of Object.entries(templates)) {
  requireMatch(`Template ${name}`, source, /ArticleFeaturedImage/, 'template must render the shared visible image.');
  requireMatch(`Template ${name}`, source, /resolveVisiblePageImage/, 'template structured data must resolve the same preferred image.');
  requireMatch(`Template ${name}`, source, new RegExp(`kind=["']${expectedKinds[name]}["']|kind:\\s*["']${expectedKinds[name]}["']`), `template must use page-image kind ${expectedKinds[name]}.`);
  forbid(`Template ${name}`, source, /featured_image_url\s*\?\s*<figure/, 'missing stored media must not hide the preferred image.');
}

if (errors.length) {
  console.error('Google-preferred page-image contract failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log('Google-preferred page-image contract passed: generated fallbacks stay 1280x720, visual-first, topic-specific, descriptive, two-line maximum, grapheme-safe and browser-validated while curated images keep priority.');
