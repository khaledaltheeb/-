import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const layout = read('app/layout.tsx');
const loader = read('components/rawafid-assistant-loader.tsx');
const brand = read('components/rawafid-brand.tsx');
const wrangler = read('wrangler.jsonc');
const productionBuild = read('scripts/cloudflare-production-build.sh');

const failures = [];
const requireText = (source, token, message) => {
  if (!source.includes(token)) failures.push(message);
};
const forbidText = (source, token, message) => {
  if (source.includes(token)) failures.push(message);
};

requireText(layout, "display: 'optional'", 'the Arabic web font must not delay the text LCP');
requireText(layout, 'preload: false', 'the large Arabic font subset must not be preloaded on every route');
requireText(layout, "process.env.NEXT_PUBLIC_ENABLE_GTM === 'true'", 'GTM must remain behind an explicit opt-in gate');
requireText(layout, 'analyticsEnabled && gtmEnabled && gtmId', 'the GTM loader must enforce the opt-in gate');
requireText(layout, 'const GA_FALLBACK_DELAY_MS = 7000', 'direct GA4 must remain outside the initial performance window');
requireText(layout, "['pointerdown', 'keydown', 'touchstart']", 'direct GA4 must load promptly on genuine user interaction');
requireText(layout, 'rawafid-ga4-delayed', 'direct GA4 must use the delayed production bootstrap');
requireText(layout, 'googletagmanager.com/gtag/js?id=', 'direct GA4 must remain enabled after its delay');
forbidText(layout, "from 'next/script'", 'the root layout must not pull the Next Script client helper into the critical path');
requireText(layout, "@/components/rawafid-assistant-loader", 'the root layout must use the on-demand assistant loader');
requireText(loader, "dynamic(() => import('./rawafid-assistant')", 'the assistant implementation must remain code-split');
requireText(loader, 'AUTO_OPEN_AFTER_MS = 12000', 'the assistant must remain outside the initial Lighthouse window');
requireText(brand, 'prefetch={false}', 'the homepage brand must not prefetch the route it is already on');
requireText(wrangler, '"NEXT_PUBLIC_ENABLE_GTM": "false"', 'production must keep the CPU-heavy GTM container disabled');
requireText(wrangler, '"NEXT_PUBLIC_ENABLE_DIRECT_GA": "true"', 'production must keep direct GA4 enabled');
requireText(productionBuild, "NEXT_PUBLIC_ENABLE_GTM='false'", 'the direct production build must keep GTM disabled');
requireText(productionBuild, "NEXT_PUBLIC_ENABLE_DIRECT_GA='true'", 'the direct production build must keep direct GA4 enabled');
requireText(productionBuild, "ENABLE_RAWAFID_ASSISTANT='true'", 'the static production build must keep the assistant enabled');

if (failures.length) {
  for (const failure of failures) console.error(`PAGESPEED PERFORMANCE CONTRACT FAILED: ${failure}`);
  process.exit(1);
}

console.log('PageSpeed performance contract passed: GA4 remains enabled but delayed beyond the critical path, heavy GTM is gated, font LCP is non-blocking, and the assistant is lazy-loaded.');
