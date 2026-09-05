#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const family = await readFile('components/family-guide-og-image.tsx', 'utf8');
const capability = await readFile('components/capability-og-image.tsx', 'utf8');
const familyRoute = await readFile('app/family-guide/images/[slug]/route.tsx', 'utf8');
const capabilityRoute = await readFile('app/capabilities/[slug]/cover/route.tsx', 'utf8');
const comparisonRoute = await readFile('app/comparisons/[slug]/cover/route.tsx', 'utf8');
const sharedLayout = await readFile('lib/seo-card-layout.ts', 'utf8');
const errors = [];

const requireMatch = (name, text, pattern, message) => {
  if (!pattern.test(text)) errors.push(`${name}: ${message}`);
};
const forbid = (name, text, pattern, message) => {
  if (pattern.test(text)) errors.push(`${name}: ${message}`);
};

for (const [name, text] of [['Family Guide OG', family], ['Capability OG', capability]]) {
  forbid(name, text, /safeTitle\.slice\(|candidate\.slice\(|candidate\.length\s*>|safeTitle\.length\s*>|\.slice\(0,\s*42\)|\.slice\(42,\s*84\)|\.slice\(84\)/, 'fixed character slicing/truncation must stay removed from generated title layout.');
  requireMatch(name, text, /fitSeoCardText/, 'shared runtime-safe text fitting must be used.');
  requireMatch(name, text, /assertSeoCardLayout/, 'hard safe-area assertions must remain active.');
  requireMatch(name, text, /maxLines:\s*3/, 'title must stay capped at three fitted lines.');
  requireMatch(name, text, /maxFontSize:\s*52/, 'title maximum font contract missing.');
  requireMatch(name, text, /minFontSize:\s*34/, 'title minimum font contract missing.');
  requireMatch(name, text, /text-anchor="start" direction="rtl" unicode-bidi="plaintext"/, 'RTL text must anchor from the RTL start/right edge.');
  requireMatch(name, text, /text-anchor="start" direction="ltr" unicode-bidi="plaintext"/, 'LTR text must anchor from the LTR start/left edge.');
  forbid(name, text, /text-anchor="end" direction="rtl"/, 'RTL end anchoring can extend beyond the right safe edge and is forbidden.');
  requireMatch(name, text, /Noto Sans Arabic,Tahoma,Arial,sans-serif/, 'Arabic-first font stack missing.');
  requireMatch(name, text, /escapeXml/, 'dynamic text must remain XML escaped.');
  requireMatch(name, text, /X-Content-Type-Options': 'nosniff'/, 'SVG MIME hardening header missing.');
}

forbid('Family Guide OG', family, /ARABIC_TEXT\.test\(title\)\s*\?\s*['"]Family guidance and practical support['"]/, 'Arabic page titles must never be replaced by a generic English title.');
requireMatch('Family Guide OG', family, /String\(title \|\| 'دليل الأسرة'\)/, 'real family-guide page title must be preserved.');
requireMatch('Family Guide OG', family, /clipPath id="family-title-safe"/, 'family title clip guard missing.');
requireMatch('Family Guide OG', family, /دليل الأسرة · روافد/, 'Arabic family-guide kicker missing.');

forbid('Capability OG', capability, /ARABIC_TEXT\.test\(title\)\s*\?\s*['"]Capability development and inclusive support['"]/, 'Arabic capability/comparison titles must never be replaced by a generic English title.');
forbid('Capability OG', capability, /ARABIC_TEXT\.test\(kicker\)\s*\?\s*['"]Capability development · RAWAFID['"]/, 'Arabic kickers must never be replaced by generic English copy.');
requireMatch('Capability OG', capability, /String\(title \|\| 'لنرتقي بقدراتهم'\)/, 'real capability/comparison page title must be preserved.');
requireMatch('Capability OG', capability, /String\(kicker \|\| 'مرجع القدرات والوصول'\)/, 'real route-provided kicker must be preserved.');
requireMatch('Capability OG', capability, /clipPath id="capability-title-safe"/, 'capability/comparison title clip guard missing.');
requireMatch('Capability OG', capability, /clipPath id="capability-kicker-safe"/, 'capability/comparison kicker clip guard missing.');
requireMatch('Capability OG', capability, /function kickerLayout/, 'kicker must have its own width-aware fit.');
requireMatch('Capability OG', capability, /maxLines:\s*1[\s\S]*maxFontSize:\s*24[\s\S]*minFontSize:\s*18/, 'single-line kicker auto-fit contract missing.');

requireMatch('Shared layout', sharedLayout, /splitOversizedToken/, 'shared oversized-token handling missing.');
requireMatch('Shared layout', sharedLayout, /ellipsizeLine/, 'shared last-resort ellipsis missing.');
requireMatch('Shared layout', sharedLayout, /widest > maxWidth/, 'shared horizontal overflow assertion missing.');
requireMatch('Shared layout', sharedLayout, /bottom > safeBottom/, 'shared vertical overflow assertion missing.');

requireMatch('Family Guide route', familyRoute, /familyGuideOgImage\(data\?\.title \|\| 'دليل الأسرة'\)/, 'family-guide image route must keep passing the published page title.');
requireMatch('Capability route', capabilityRoute, /capabilityOgImage\(record\.title, 'دليل قدرات ووصول'\)/, 'capability route must keep passing its real title and Arabic kicker.');
requireMatch('Comparison route', comparisonRoute, /capabilityOgImage/, 'comparison image route must continue through the hardened shared capability image component.');

if (errors.length) {
  console.error('Family/Capability OG image contract failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Family/Capability OG image contract passed: family-guide, capability, and comparison covers preserve their real Arabic titles and use shared width-aware RTL/LTR fitting, hard safe areas, and clipping.');
