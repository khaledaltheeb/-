import fs from 'node:fs';

const read = (file) => fs.readFileSync(file, 'utf8');
const layout = read('app/layout.tsx');
const homepage = read('app/page.tsx');
const siteHeader = read('components/site-header.tsx');
const siteFooter = read('components/site-footer.tsx');
const assistant = read('components/rawafid-assistant.tsx');
const imperativeTools = read('components/webmcp-imperative-tools.tsx');
const loader = read('components/rawafid-assistant-loader.tsx');
const brand = read('components/rawafid-brand.tsx');
const nextConfig = read('next.config.ts');
const wrangler = read('wrangler.jsonc');
const productionBuild = read('scripts/cloudflare-production-build.sh');
const deployWorkflow = read('.github/workflows/deploy-production.yml');
const qualityWorkflow = read('.github/workflows/quality.yml');

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
requireText(layout, "@/components/webmcp-imperative-tools", 'the root layout must render the imperative WebMCP bootstrap without a client bundle');
requireText(layout, '<WebMcpImperativeTools />', 'the imperative WebMCP tool bootstrap must remain present on every page');
requireText(loader, "dynamic(() => import('./rawafid-assistant')", 'the assistant implementation must remain code-split');
requireText(loader, 'AUTO_OPEN_AFTER_MS = 12000', 'the assistant must remain outside the initial Lighthouse performance window');
requireText(brand, 'prefetch={false}', 'the homepage brand must not prefetch the route it is already on');

requireText(homepage, 'toolname="searchRawafid"', 'the homepage search form must remain registered as a WebMCP tool');
requireText(homepage, 'tooldescription="Search Rawafid', 'the homepage WebMCP tool must retain a meaningful tool description');
requireText(homepage, 'toolautosubmit=""', 'the safe homepage search WebMCP tool must remain directly invokable by agents');
requireText(homepage, 'toolparamdescription="The user\'s Arabic or English search query', 'the homepage WebMCP search input must retain an explicit parameter description');
requireText(homepage, 'required', 'the homepage WebMCP search query must remain required so its generated JSON Schema is explicit');

requireText(siteHeader, 'toolname="searchRawafidHeader"', 'the desktop header search form must remain covered by WebMCP');
requireText(siteHeader, 'toolname="searchRawafidMobile"', 'the mobile navigation search form must remain covered by WebMCP');
requireText(siteHeader, 'toolparamdescription="The user\'s Arabic or English search query from the site header."', 'the header WebMCP search parameter must remain described');
requireText(siteHeader, 'toolparamdescription="The user\'s Arabic or English search query from the mobile navigation."', 'the mobile WebMCP search parameter must remain described');

requireText(siteFooter, 'toolname="searchRawafidFooter"', 'the site footer search form must remain covered by WebMCP');
requireText(siteFooter, 'tooldescription="Search Rawafid from the site footer', 'the footer WebMCP tool must retain a meaningful description');
requireText(siteFooter, 'toolautosubmit=""', 'the safe footer search WebMCP tool must remain directly invokable by agents');
requireText(siteFooter, 'toolparamdescription="The user\'s Arabic or English footer search query', 'the footer WebMCP search parameter must remain described');
requireText(siteFooter, 'required', 'the footer WebMCP search query must remain required so its generated JSON Schema is explicit');

requireText(assistant, 'toolname="askRawafidAssistant"', 'the lazy Rawafid assistant form must remain covered by WebMCP when it appears');
requireText(assistant, 'tooldescription="Ask Rawafid\'s on-site assistant', 'the assistant WebMCP tool must retain a meaningful description');
requireText(assistant, 'name="query"', 'the assistant WebMCP textarea must retain a schema property name');
requireText(assistant, 'toolparamdescription="The user\'s Arabic or English question', 'the assistant WebMCP parameter must remain described');

forbidText(imperativeTools, "'use client'", 'the imperative WebMCP bootstrap must stay server-rendered and must not add a hydration bundle');
requireText(imperativeTools, 'document.modelContext', 'the imperative WebMCP bootstrap must feature-detect the browser model context');
requireText(imperativeTools, 'context.registerTool(tool)', 'the imperative WebMCP tool must be registered through the current document.modelContext API');
requireText(imperativeTools, "name: 'search_rawafid_evidence'", 'the stable imperative WebMCP search tool name must remain registered');
requireText(imperativeTools, 'inputSchema:', 'the imperative WebMCP tool must expose an explicit JSON Schema');
requireText(imperativeTools, "required: ['query']", 'the imperative WebMCP schema must require the search query');
requireText(imperativeTools, 'additionalProperties: false', 'the imperative WebMCP schema must reject unknown properties');
requireText(imperativeTools, 'readOnlyHint: true', 'the Rawafid search WebMCP tool must remain correctly marked read-only');
requireText(imperativeTools, 'untrustedContentHint: true', 'search result text returned to agents must remain marked as untrusted content');
requireText(imperativeTools, "fetch('/api/search/v3?q='", 'the imperative WebMCP tool must execute against Rawafid\'s existing search API');
requireText(imperativeTools, "id=\"rawafid-webmcp-imperative\"", 'the imperative WebMCP bootstrap must retain a stable rendered script identifier');

requireText(nextConfig, 'tools=(self)', 'the Permissions-Policy must explicitly allow same-origin WebMCP tools');
requireText(wrangler, '"NEXT_PUBLIC_ENABLE_GTM": "false"', 'production must keep the CPU-heavy GTM container disabled');
requireText(wrangler, '"NEXT_PUBLIC_ENABLE_DIRECT_GA": "true"', 'production must keep direct GA4 enabled');
requireText(productionBuild, "NEXT_PUBLIC_ENABLE_GTM='false'", 'the direct production build must keep GTM disabled');
requireText(productionBuild, "NEXT_PUBLIC_ENABLE_DIRECT_GA='true'", 'the direct production build must keep direct GA4 enabled');
requireText(productionBuild, "ENABLE_RAWAFID_ASSISTANT='true'", 'the static production build must keep the assistant enabled');

requireText(deployWorkflow, 'librsvg2-bin', 'production deployment must install rsvg-convert because the production build renders Quick Info SVG cards');
requireText(qualityWorkflow, 'for tool in searchRawafid searchRawafidHeader searchRawafidMobile searchRawafidFooter; do', 'fast quality runtime smoke must assert all server-rendered homepage WebMCP search tools before merge');
requireText(qualityWorkflow, 'grep -q \'tooldescription="Search Rawafid\' /tmp/home.html', 'fast quality runtime smoke must assert a rendered WebMCP tool description');
requireText(qualityWorkflow, 'grep -q \'toolparamdescription="The user\' /tmp/home.html', 'fast quality runtime smoke must assert rendered WebMCP parameter schema metadata');
requireText(deployWorkflow, 'WEBMCP_LIVE_DIAGNOSTIC', 'production live verification must retain a non-blocking WebMCP diagnostic');
forbidText(deployWorkflow, 'for attempt in $(seq 1 36); do', 'production deployment must not spend up to six minutes waiting for homepage ISR propagation');

if (failures.length) {
  for (const failure of failures) console.error(`PAGESPEED PERFORMANCE CONTRACT FAILED: ${failure}`);
  process.exit(1);
}

console.log('PageSpeed performance contract passed: production build prerequisites are present, GA4 remains delayed beyond the critical path, heavy GTM is gated, font LCP is non-blocking, every server-rendered homepage search surface plus the lazy assistant has declarative WebMCP coverage, a zero-hydration imperative WebMCP search tool is registered with a strict schema, and production verification stays fast.');
