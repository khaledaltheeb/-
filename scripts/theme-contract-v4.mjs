import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => { console.error(`THEME V4 CONTRACT FAILED: ${message}`); process.exitCode = 1; };

const layout = read('app/layout.tsx');
const header = read('components/site-header.tsx');
const footer = read('components/site-footer.tsx');
const brand = read('components/rawafid-brand.tsx');
const manifest = read('public/manifest.webmanifest');
const serviceWorker = read('public/sw.js');
const pwaIcon = read('lib/pwa-icon.ts');
const theme = read('app/rawafid-theme.css');
const publicEnhancements = read('app/public-enhancements.css');
const visualStability = read('app/visual-stability.css');
const megaNav = read('app/mega-nav-v3.css');
const adminTheme = read('app/theme-admin-v4.css');
const themeLib = read('lib/theme.ts');
const agents = read('AGENTS.md');

if (!layout.includes("'./rawafid-theme.css'")) fail('root layout must import the central theme entry point');

const directCssImports = [...layout.matchAll(/^import\s+["'](\.\/[^"']+\.css)["'];?\s*$/gm)].map((match) => match[1]);
if (directCssImports.length !== 1 || directCssImports[0] !== './rawafid-theme.css') {
  fail(`root layout must have exactly one direct global CSS import; found: ${directCssImports.join(', ')}`);
}

const visualStabilityExecutable = visualStability.replace(/\/\*[\s\S]*?\*\//g, '').trim();
if (visualStabilityExecutable) {
  fail('visual-stability.css is retired and must not contain executable global overrides');
}

for (const token of ['--rf-brand:', '--rf-page:', '--rf-ink:', '--rf-radius-lg:', '--rf-shadow-md:', '--rf-font-display:']) {
  if (!theme.includes(token)) fail(`central theme missing semantic token ${token}`);
}

for (const rule of ['.site-header', '.rawafid-hero', '.rawafid-platform-grid']) {
  if (!theme.includes(rule)) fail(`central theme missing core rule ${rule}`);
}

if (!/@media\s*\(max-width:\s*720px\)/.test(theme)) fail('central theme missing mobile breakpoint');
if (!/@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(theme)) fail('central theme missing reduced-motion contract');
if (!theme.includes("@import './theme-admin-v4.css'")) fail('central theme must load the scoped V4 admin layer');
if (!adminTheme.includes('.admin-app-shell') || !adminTheme.includes('.dashboard-card')) fail('admin V4 layer missing core admin selectors');

if (!brand.includes('<strong>منصة روافد</strong>')) fail('shared brand component must use the full institutional brand name');
for (const token of ['--rf-v5-aqua:', '--rf-v5-glass:', '--rf-v5-shadow-hover:']) {
  if (!theme.includes(token)) fail(`institutional V5 layer missing ${token}`);
}
for (const rule of ['.brand-mark .logo-stream', '.rawafid-hero-visual', '.site-footer:before']) {
  if (!theme.includes(rule)) fail(`institutional V5 layer missing core rule ${rule}`);
}
if (!theme.includes('@media(forced-colors:active)')) fail('institutional V5 layer missing forced-colors support');
if (!brand.includes('logo-stream') || !brand.includes('معرفة تقود إلى أثر')) fail('shared brand component must preserve the original Rawafid mark and slogan');
if (!header.includes("import RawafidBrand from '@/components/rawafid-brand'") || !footer.includes("import RawafidBrand from '@/components/rawafid-brand'")) fail('header and footer must use the shared Rawafid brand component');
if (!manifest.includes('منصة روافد | معرفة تقود إلى أثر')) fail('PWA name must match institutional identity');
if (!pwaIcon.includes("#e6b650") || !pwaIcon.includes("#075f61")) fail('generated PWA icons must match institutional identity');
if (!themeLib.includes("RAWAFID_BRAND_NAME = 'منصة روافد'")) fail('theme library must centralize the institutional brand name');
if (!themeLib.includes('resolveSectorAccent')) fail('theme library must normalize sector accents without database writes');
if (!themeLib.includes("teal: '#0b7f7c'") || !themeLib.includes("fallback = '#0b7f7c'")) fail('legacy teal aliases and fallbacks must resolve to the V5 brand color');
if (!agents.includes('app/rawafid-theme.css')) fail('agent rules must preserve the central theme entry point');

for (const token of ['Rawafid Institutional V5.1', 'font-family:var(--font-arabic)', '--rf-reading-measure:72ch', '.footer-search', '.theme-preview-type-specimen']) {
  if (!theme.includes(token)) fail(`institutional V5.1 layer missing ${token}`);
}
for (const token of ['.rawafid-home .hero-pathway-list>a', '.rawafid-home .rawafid-editorial-grid', '.rawafid-home .rawafid-editorial-grid h3 a']) {
  if (!publicEnhancements.includes(token)) fail(`homepage V5 surface completion missing ${token}`);
}
if (!layout.includes("themeColor: '#075f61'")) fail('browser theme color must match the V5/PWA institutional chrome color');
if (!header.includes('data-nav-priority') || !header.includes('حالة، دليل أو خدمة')) fail('V5.1 header must keep intent-led navigation and search');
for (const token of ['footer-search', 'footer-trust-list', 'back-to-top']) {
  if (!footer.includes(token)) fail(`V5.1 footer missing ${token}`);
}
if (!footer.includes("style={{ display: 'block', padding: 0 }}")) fail('institutional footer must stay isolated from the legacy generic footer flex/padding rule');
for (const token of ['position:fixed!important', 'max-height:min(76dvh,680px)!important', 'overflow-y:auto!important']) {
  if (!megaNav.includes(token)) fail(`mega navigation viewport guard missing ${token}`);
}
if (!layout.includes('<body id="top">') || !layout.includes('?v=6')) fail('root layout must expose the top target and V6 PWA identity');
if (!manifest.includes('?v=6')) fail('PWA manifest must use V6 icon identity');
if (!serviceWorker.includes('rawafid-shell-v6') || !serviceWorker.includes('event.waitUntil(cacheWrite')) fail('service worker must use the V6 cache and durable asset writes');

if (!process.exitCode) console.log('Rawafid central theme V4 contract passed.');
