import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const layout = read('app/layout.tsx');
const homepage = read('app/page.tsx');
const loader = read('components/rawafid-assistant-loader.tsx');
const brand = read('components/rawafid-brand.tsx');
const nextConfig = read('next.config.ts');
const wrangler = read('wrangler.jsonc');
const productionBuild = read('scripts/cloudflare-production-build.sh');
const deployWorkflow = read('.github/workflows/deploy-production.yml');

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
requireText(homepage, 'toolname="searchRawafid"', 'the homepage search form must remain registered as a WebMCP tool');
requireText(homepage, 'tooldescription="Search Rawafid', 'the homepage WebMCP tool must retain a meaningful tool description');
requireText(homepage, 'toolautosubmit=""', 'the safe search WebMCP tool must remain directly invokable by agents');
requireText(homepage, 'toolparamdescription="The user\'s Arabic or English search query', 'the WebMCP search input must retain an explicit parameter description');
requireText(homepage, 'required', 'the WebMCP search query must remain required so its generated JSON Schema is explicit');
requireText(nextConfig, 'tools=(self)', 'the Permissions-Policy must explicitly allow same-origin WebMCP tools');
requireText(wrangler, '"NEXT_PUBLIC_ENABLE_GTM": "false"', 'production must keep the CPU-heavy GTM container disabled');
requireText(wrangler, '"NEXT_PUBLIC_ENABLE_DIRECT_GA": "true"', 'production must keep direct GA4 enabled');
requireText(productionBuild, "NEXT_PUBLIC_ENABLE_GTM='false'", 'the direct production build must keep GTM disabled');
requireText(productionBuild, "NEXT_PUBLIC_ENABLE_DIRECT_GA='true'", 'the direct production build must keep direct GA4 enabled');
requireText(productionBuild, "ENABLE_RAWAFID_ASSISTANT='true'", 'the static production build must keep the assistant enabled');
requireText(deployWorkflow, 'grep -q \'toolname="searchRawafid"\' /tmp/home.html', 'production live verification must assert the WebMCP tool name in rendered HTML');
requireText(deployWorkflow, 'grep -q \'tooldescription="Search Rawafid\' /tmp/home.html', 'production live verification must assert the WebMCP tool description in rendered HTML');
requireText(deployWorkflow, 'grep -q \'toolparamdescription="The user\' /tmp/home.html', 'production live verification must assert the WebMCP parameter schema metadata in rendered HTML');

if (failures.length) {
  for (const failure of failures) console.error(`PAGESPEED PERFORMANCE CONTRACT FAILED: ${failure}`);
  process.exit(1);
}

console.log('PageSpeed performance contract passed: GA4 remains enabled but delayed beyond the critical path, heavy GTM is gated, font LCP is non-blocking, the assistant is lazy-loaded, and WebMCP is guarded both at source and in production live verification.');
