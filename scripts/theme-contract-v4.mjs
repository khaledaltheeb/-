import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const fail = (message) => { console.error(`THEME V4 CONTRACT FAILED: ${message}`); process.exitCode = 1; };

const layout = read('app/layout.tsx');
const header = read('components/site-header.tsx');
const theme = read('app/rawafid-theme.css');
const adminTheme = read('app/theme-admin-v4.css');
const themeLib = read('lib/theme.ts');
const agents = read('AGENTS.md');

if (!layout.includes("'./rawafid-theme.css'")) fail('root layout must import the central theme entry point');

const directCssImports = [...layout.matchAll(/^import\s+["'](\.\/[^"']+\.css)["'];?\s*$/gm)].map((match) => match[1]);
if (directCssImports.length !== 1 || directCssImports[0] !== './rawafid-theme.css') {
  fail(`root layout must have exactly one direct global CSS import; found: ${directCssImports.join(', ')}`);
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

if (!header.includes('<strong>منصة روافد</strong>')) fail('global header must use the full institutional brand name');
if (!themeLib.includes("RAWAFID_BRAND_NAME = 'منصة روافد'")) fail('theme library must centralize the institutional brand name');
if (!themeLib.includes('resolveSectorAccent')) fail('theme library must normalize sector accents without database writes');
if (!agents.includes('app/rawafid-theme.css')) fail('agent rules must preserve the central theme entry point');

if (!process.exitCode) console.log('Rawafid central theme V4 contract passed.');
