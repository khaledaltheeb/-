import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => { console.error(`THEME V5 CONTRACT FAILED: ${message}`); process.exitCode = 1; };

const layout = read('app/layout.tsx');
const header = read('components/site-header.tsx');
const footer = read('components/site-footer.tsx');
const home = read('app/page.tsx');
const theme = read('app/rawafid-theme.css');
const adminLayout = read('app/admin/layout.tsx');
const adminHome = read('app/admin/page.tsx');
const contentForm = read('app/admin/content/content-form.tsx');
const pwaIcon = read('lib/pwa-icon.ts');

if (!layout.includes("'./rawafid-theme.css'")) fail('root layout must import the central theme entry point');
const directCssImports = [...layout.matchAll(/^import\s+["'](\.\/[^"']+\.css)["'];?\s*$/gm)].map((match) => match[1]);
if (directCssImports.length !== 1 || directCssImports[0] !== './rawafid-theme.css') fail('root layout must keep one global CSS entry point');

for (const file of ['components/rawafid-mark.tsx', 'lib/public-content.ts', 'lib/content-templates.ts', 'app/admin/verification/page.tsx']) {
  if (!exists(file)) fail(`missing V5 foundation ${file}`);
}

for (const marker of ['Rawafid Institutional Theme V5', '.site-assurance-bar', '.hero-pathway-list', '.rawafid-editorial-grid', '.verification-hub-stats', '.content-template-grid', '.cms-editor-steps']) {
  if (!theme.includes(marker)) fail(`central theme missing ${marker}`);
}

if (!header.includes('RawafidMark') || !footer.includes('RawafidMark')) fail('public chrome must use the unified Rawafid mark');
for (const label of ['اكتشف', 'القطاعات', 'المختصون والمراكز', 'الأدوات', 'المعرفة']) {
  if (!header.includes(label)) fail(`institutional navigation missing ${label}`);
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

if (!process.exitCode) console.log('Rawafid institutional theme V5 contract passed.');
