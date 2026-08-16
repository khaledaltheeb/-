import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => { console.error(`THEME V7.1 CONTRACT FAILED: ${message}`); process.exitCode = 1; };

const layout = read('app/layout.tsx');
const header = read('components/site-header.tsx');
const footer = read('components/site-footer.tsx');
const brand = read('components/rawafid-brand.tsx');
const manifest = read('public/manifest.webmanifest');
const serviceWorker = read('public/sw.js');
const home = read('app/page.tsx');
const theme = read('app/rawafid-theme.css');
const themeV6 = read('app/rawafid-theme-v6.css');
const themeV7 = read('app/rawafid-theme-v7.css');
const themeV71 = read('app/rawafid-theme-v7-1.css');
const adminLayout = read('app/admin/layout.tsx');
const adminHome = read('app/admin/page.tsx');
const contentForm = read('app/admin/content/content-form.tsx');
const pwaIcon = read('lib/pwa-icon.ts');
const preview = read('app/theme-preview/page.tsx');

if (!layout.includes("'./rawafid-theme-v7-1.css'")) fail('root layout must import the central V7.1 theme entry point');
const directCssImports = [...layout.matchAll(/^import\s+["'](\.\/[^"']+\.css)["'];?\s*$/gm)].map((match) => match[1]);
if (directCssImports.length !== 1 || directCssImports[0] !== './rawafid-theme-v7-1.css') fail('root layout must keep one global V7.1 CSS entry point');
if (!themeV71.startsWith("@import './rawafid-theme-v7.css';")) fail('V7.1 must preserve V7 as its visual base');
if (!themeV7.startsWith("@import './rawafid-theme-v6.css';")) fail('V7 theme must preserve the proven V6.1 public layer');
if (!themeV6.startsWith("@import './rawafid-theme.css';")) fail('V6 theme must preserve the proven V5 compatibility theme as its base');
if (!themeV71.includes('Rawafid Institutional Theme V7.1')) fail('V7.1 theme marker missing');
if (!themeV7.includes('Rawafid Institutional Theme V7')) fail('V7 compatibility marker missing');
if (!themeV6.includes('Rawafid Institutional Theme V6')) fail('V6 compatibility marker missing');
if (/letter-spacing:-(?:\d|\.)/.test(themeV7) || /letter-spacing:-(?:\d|\.)/.test(themeV71)) fail('public Arabic typography must not use negative letter spacing');

for (const marker of [
  '--rf-container:82rem',
  '--rf-focus:#0b67c2',
  '--rf-control-height:46px',
  'scrollbar-gutter:stable',
  '.rawafid-intent-grid{',
  'grid-template-columns:repeat(3,minmax(0,1fr))',
  '.mobile-bottom-nav a{min-height:56px;font-size:11px}',
  '@media(max-width:560px)',
  '@media(prefers-contrast:more)',
]) {
  if (!themeV7.includes(marker)) fail(`V7 institutional regression marker missing ${marker}`);
}

for (const marker of [
  'Rawafid Institutional Theme V7.1',
  'backdrop-filter:none',
  '-webkit-backdrop-filter:none',
  '.mega-nav-panel{box-shadow:',
  '.rawafid-hero-visual{box-shadow:',
]) {
  if (!themeV71.includes(marker)) fail(`V7.1 rendering regression marker missing ${marker}`);
}
for (const forbidden of ['content-visibility:auto', 'contain-intrinsic-size:auto 720px']) {
  if (themeV71.includes(forbidden)) fail(`V7.1 must not reintroduce deferred semantic rendering: ${forbidden}`);
}

for (const marker of [
  'font-synthesis:none',
  '--rf-muted:#60767b',
  '.mobile-bottom-nav a{font-size:11px}',
  '.footer-groups{grid-template-columns:repeat(2,minmax(0,1fr))}',
  '@media(max-width:560px){.footer-groups{grid-template-columns:1fr}',
]) {
  if (!themeV6.includes(marker)) fail(`V6 compatibility regression marker missing ${marker}`);
}

for (const file of ['components/rawafid-mark.tsx', 'components/rawafid-brand.tsx', 'lib/public-content.ts', 'lib/content-templates.ts', 'app/admin/verification/page.tsx']) {
  if (!exists(file)) fail(`missing V5 foundation ${file}`);
}

for (const marker of ['Rawafid Institutional Theme V5', '.site-assurance-bar', '.hero-pathway-list', '.rawafid-editorial-grid', '.verification-hub-stats', '.content-template-grid', '.cms-editor-steps']) {
  if (!theme.includes(marker)) fail(`central theme missing ${marker}`);
}

if (!brand.includes('RawafidMark') || !brand.includes('معرفة تقود إلى أثر')) fail('shared brand must use the unified Rawafid mark and slogan');
if (!header.includes("import RawafidBrand from '@/components/rawafid-brand'") || !footer.includes("import RawafidBrand from '@/components/rawafid-brand'")) fail('public chrome must use the shared Rawafid brand');
if (!header.includes("import Link from 'next/link'") || !footer.includes("import Link from 'next/link'") || !home.includes("import Link from 'next/link'")) fail('public navigation must use Next Link for smooth internal transitions');
const unboundedLink = /<Link\b(?![^>]*\bprefetch=\{false\})[^>]*>/;
for (const [name, source] of [['brand', brand], ['header', header], ['footer', footer], ['homepage', home]]) {
  if (unboundedLink.test(source)) fail(`${name} contains an automatic Next Link prefetch`);
}
for (const file of [
  'app/sections/page.tsx',
  'app/sectors/page.tsx',
  'app/encyclopedia/page.tsx',
  'app/encyclopedia/index/[page]/page.tsx',
  'app/evidence-guides/page.tsx',
  'app/search/page.tsx',
  'app/specialists/page.tsx',
  'app/centers/page.tsx',
  'app/community/page.tsx',
  'app/quick-info/page.tsx',
  'app/experiences/page.tsx',
]) {
  if (unboundedLink.test(read(file))) fail(`${file} contains an automatic collection prefetch`);
}
if (!header.includes('className="skip-link"') || !header.includes('id="main-content"') || !header.includes('className="skip-target"')) fail('public chrome must expose a keyboard bypass target');
for (const label of ['استكشف روافد', 'الأقسام', 'الموسوعة', 'الأدلة', 'ذوو الاحتياجات الخاصة والدمج', 'حالة، دليل أو خدمة']) {
  if (!header.includes(label)) fail(`institutional navigation missing ${label}`);
}

for (const internalTerm of ['RBAC', 'RLS', 'Core واحد', 'Mobile + PWA', 'SEO وبحث مترابط']) {
  if (home.includes(internalTerm)) fail(`homepage exposes implementation language: ${internalTerm}`);
}
for (const marker of ['getHomepageContent', 'hero-pathway-list', 'rawafid-editorial-grid', 'rawafid-professional-callout']) {
  if (!home.includes(marker)) fail(`homepage missing institutional experience ${marker}`);
}

if (!adminLayout.includes("'/admin/verification'")) fail('admin navigation must expose the verification center');
if (!adminHome.includes('pendingVerification') || !adminHome.includes('/admin/content/new')) fail('admin overview must prioritize verification and page creation');
for (const marker of ['cms-editor-steps', 'initialType', 'content-basics', 'content-seo']) {
  if (!contentForm.includes(marker)) fail(`content authoring flow missing ${marker}`);
}

const verification = read('app/admin/verification/page.tsx');
for (const marker of ['admin_specialist_queue_v2', 'admin_center_queue_v2', 'community_profiles', 'provider_verification_documents', 'قائمة الأولوية']) {
  if (!verification.includes(marker)) fail(`verification center missing ${marker}`);
}

if (/['\"]R['\"]/.test(pwaIcon)) fail('PWA identity must not fall back to a Latin letter');
if (!pwaIcon.includes('M13 44c14-1')) fail('PWA icon must use the unified tributary mark');

for (const marker of ['Rawafid Institutional V5.1', 'Rawafid Institutional V5.2', 'font-family:var(--font-arabic)', '--rf-reading-measure:72ch', '.footer-search', '.theme-preview-type-specimen', '.skip-link', '.skip-target']) {
  if (!theme.includes(marker)) fail(`central theme missing V5.1 marker ${marker}`);
}
for (const marker of ['footer-search', 'back-to-top']) {
  if (!footer.includes(marker)) fail(`institutional footer missing ${marker}`);
}
for (const forbidden of [
  'مراجعة منهجية',
  'مصادر قابلة للتتبع',
  'خصوصية ووصولية',
  'المحتوى للتثقيف العام ولا يحل محل التقييم أو التشخيص أو العلاج المهني الفردي.',
  'هوية عربية · متوافق مع الهاتف · وصولية وخصوصية منذ التصميم',
]) {
  if (footer.includes(forbidden)) fail(`institutional footer must not include removed promotional/disclaimer copy: ${forbidden}`);
}
const skipLinkRule = theme.match(/\.skip-link\{[^}]+\}/)?.[0] ?? '';
if (!skipLinkRule.includes('transition:none')) fail('keyboard bypass must not depend on a transition');
if (!theme.includes('.skip-link:not(:focus):not(:focus-visible){transform:translateY(calc(-100% - 24px))}')) fail('keyboard bypass may hide only while unfocused');
if (!preview.includes('Institutional Design System V5.2') || preview.includes('<h1>نموذج لوحة التحكم</h1>') || !preview.includes('المستضاف محليًا ضمن حزمة المنصة')) fail('theme preview must expose accurate compatibility semantics');
if (!layout.includes('<body id="top">') || !layout.includes('?v=6')) fail('layout must preserve the current PWA identity lifecycle');
if (!manifest.includes('منصة روافد | معرفة تقود إلى أثر') || !manifest.includes('?v=6')) fail('manifest must preserve the current institutional identity');
if (!serviceWorker.includes('rawafid-shell-v6') || !serviceWorker.includes('event.waitUntil(cacheWrite')) fail('service worker must preserve the current cache lifecycle');

if (!process.exitCode) console.log('Rawafid institutional theme V7.1 contract passed.');
