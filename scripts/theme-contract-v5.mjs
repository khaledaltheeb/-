import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => { console.error(`THEME V5 CONTRACT FAILED: ${message}`); process.exitCode = 1; };

const layout = read('app/layout.tsx');
const header = read('components/site-header.tsx');
const footer = read('components/site-footer.tsx');
const brand = read('components/rawafid-brand.tsx');
const manifest = read('public/manifest.webmanifest');
const serviceWorker = read('public/sw.js');
const home = read('app/page.tsx');
const theme = read('app/rawafid-theme.css');
const adminLayout = read('app/admin/layout.tsx');
const adminHome = read('app/admin/page.tsx');
const contentForm = read('app/admin/content/content-form.tsx');
const pwaIcon = read('lib/pwa-icon.ts');
const preview = read('app/theme-preview/page.tsx');

if (!layout.includes("'./rawafid-theme.css'")) fail('root layout must import the central theme entry point');
const directCssImports = [...layout.matchAll(/^import\s+["'](\.\/[^"']+\.css)["'];?\s*$/gm)].map((match) => match[1]);
if (directCssImports.length !== 1 || directCssImports[0] !== './rawafid-theme.css') fail('root layout must keep one global CSS entry point');

for (const file of ['components/rawafid-mark.tsx', 'components/rawafid-brand.tsx', 'lib/public-content.ts', 'lib/content-templates.ts', 'app/admin/verification/page.tsx']) {
  if (!exists(file)) fail(`missing V5 foundation ${file}`);
}

for (const marker of ['Rawafid Institutional Theme V5', '.site-assurance-bar', '.hero-pathway-list', '.rawafid-editorial-grid', '.verification-hub-stats', '.content-template-grid', '.cms-editor-steps']) {
  if (!theme.includes(marker)) fail(`central theme missing ${marker}`);
}

if (!brand.includes('RawafidMark') || !brand.includes('معرفة تقود إلى أثر')) fail('shared brand must use the unified Rawafid mark and slogan');
if (!header.includes("import RawafidBrand from '@/components/rawafid-brand'") || !footer.includes("import RawafidBrand from '@/components/rawafid-brand'")) fail('public chrome must use the shared Rawafid brand');
if (!header.includes("import Link from 'next/link'") || !footer.includes("import Link from 'next/link'") || !home.includes("import Link from 'next/link'")) fail('public navigation must use Next Link for smooth internal transitions');
if (!header.includes('prefetch={false}') || !footer.includes('prefetch={false}') || !home.includes('prefetch={false}')) fail('dense public navigation must disable automatic prefetch to protect Worker resources');
if (!header.includes('className="skip-link"') || !header.includes('id="main-content"') || !header.includes('className="skip-target"')) fail('public chrome must expose a keyboard bypass target');
for (const label of ['استكشف روافد', 'الأقسام', 'الموسوعة', 'الأدلة', 'ذوو الاحتياجات الخاصة والدمج', 'حالة، دليل أو خدمة']) {
  if (!header.includes(label)) fail(`institutional V5.1 navigation missing ${label}`);
}

for (const internalTerm of ['RBAC', 'RLS', 'Core واحد', 'Mobile + PWA', 'SEO وبحث مترابط']) {
  if (home.includes(internalTerm)) fail(`homepage exposes implementation language: ${internalTerm}`);
}
for (const marker of ['getHomepageContent', 'hero-pathway-list', 'rawafid-editorial-grid', 'rawafid-professional-callout']) {
  if (!home.includes(marker)) fail(`homepage missing V5 experience ${marker}`);
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
for (const marker of ['footer-search', 'footer-trust-list', 'back-to-top']) {
  if (!footer.includes(marker)) fail(`institutional footer missing ${marker}`);
}
if (!preview.includes('Institutional Design System V5.2') || preview.includes('<h1>نموذج لوحة التحكم</h1>') || !preview.includes('المستضاف محليًا ضمن حزمة المنصة')) fail('theme preview must expose accurate V5.2 semantics');
if (!layout.includes('<body id="top">') || !layout.includes('?v=6')) fail('layout must expose the top target and V6 PWA identity');
if (!manifest.includes('منصة روافد | معرفة تقود إلى أثر') || !manifest.includes('?v=6')) fail('manifest must use the V6 institutional identity');
if (!serviceWorker.includes('rawafid-shell-v6') || !serviceWorker.includes('event.waitUntil(cacheWrite')) fail('service worker must use V6 cache lifecycle');

if (!process.exitCode) console.log('Rawafid institutional theme V5.2 contract passed.');
