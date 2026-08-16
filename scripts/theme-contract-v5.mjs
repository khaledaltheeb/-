import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => { console.error(`THEME V5 UX CONTRACT FAILED: ${message}`); process.exitCode = 1; };

const layout = read('app/layout.tsx');
const header = read('components/site-header.tsx');
const footer = read('components/site-footer.tsx');
const brand = read('components/rawafid-brand.tsx');
const home = read('app/page.tsx');
const homeTheme = read('app/theme-empty.css');
const publicContent = read('lib/public-content.ts');
const designSystem = read('docs/DESIGN-SYSTEM.md');

if (!layout.includes("'./rawafid-theme.css'")) fail('root layout must keep the central theme entry point');
if (!brand.includes('logo-stream') || !brand.includes('معرفة تقود إلى أثر')) fail('shared RawafidBrand must preserve the current tributary mark and slogan');
if (!header.includes("import RawafidBrand from '@/components/rawafid-brand'")) fail('header must keep the shared RawafidBrand component');
if (!footer.includes("import RawafidBrand from '@/components/rawafid-brand'")) fail('footer must keep the shared RawafidBrand component');

for (const marker of ['site-assurance-bar', '/medical-review-policy', '/join', 'حالة، دليل أو خدمة']) {
  if (!header.includes(marker)) fail(`header missing institutional UX marker ${marker}`);
}

for (const internalTerm of ['RBAC', 'RLS', 'Core واحد', 'Mobile + PWA', 'SEO وبحث مترابط']) {
  if (home.includes(internalTerm)) fail(`homepage exposes implementation language: ${internalTerm}`);
}

for (const marker of ['getHomepageContent', 'hero-pathway-list', 'rawafid-editorial-grid', 'rawafid-professional-callout', 'latestContent.length > 0']) {
  if (!home.includes(marker)) fail(`homepage missing intent-led UX marker ${marker}`);
}

for (const selector of ['.hero-pathway-list', '.rawafid-intent-grid', '.rawafid-editorial-grid', '.rawafid-professional-callout']) {
  if (!homeTheme.includes(selector)) fail(`homepage theme missing ${selector}`);
}

for (const guard of [
  "status: 'eq.published'",
  "robots_index: 'eq.true'",
  'published_at: `lte.${now}`',
  "revalidate: 300",
]) {
  if (!publicContent.includes(guard)) fail(`homepage content reader missing publication guard ${guard}`);
}
if (!publicContent.includes('if (!projectUrl || !publishableKey) return []')) fail('homepage content reader must fail closed when public Supabase configuration is unavailable');
if (!publicContent.includes('if (!response.ok) return []')) fail('homepage content reader must fail closed on upstream errors');

if (!designSystem.includes('Institutional Design System V5.2')) fail('design system documentation must describe the current V5.2 UX layer');

if (!process.exitCode) console.log('Rawafid institutional V5.2 UX contract passed.');
