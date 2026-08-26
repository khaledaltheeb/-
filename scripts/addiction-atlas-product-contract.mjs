import { readFile } from 'node:fs/promises';

function assert(condition, message) {
  if (!condition) throw new Error(`addiction-atlas-product-contract: ${message}`);
}

const [hub, compare, sector, atlasBrowser, interactionBrowser] = await Promise.all([
  readFile('components/addiction-atlas-hub-portal.tsx', 'utf8'),
  readFile('app/addiction/compare/page.tsx', 'utf8'),
  readFile('app/sectors/[slug]/page.tsx', 'utf8'),
  readFile('components/addiction-atlas-browser.tsx', 'utf8'),
  readFile('components/addiction-interaction-browser.tsx', 'utf8'),
]);

for (const route of ['/addiction/substances/', '/addiction/compare/', '/addiction/interactions/', '/addiction/prevalence/', '/addiction/mortality/', '/addiction/methodology/']) {
  assert(hub.includes(route), `hub missing primary route ${route}`);
  assert(sector.includes(route), `addiction sector missing primary route ${route}`);
}

assert(hub.includes('موسوعة روافد التفاعلية'), 'hub portal identity missing');
assert(sector.includes("sector.slug === 'addiction-recovery'"), 'sector integration must stay scoped to addiction-recovery');
assert(compare.includes('AddictionComparisonExplorer'), 'comparison hub must render the interactive comparison explorer');
assert(compare.includes('صفحة مفهرسة لكل تركيبة ممكنة'), 'comparison hub must preserve anti-scaled-content editorial policy');
assert(atlasBrowser.includes('مقارنة تفاعلية بين مادتين'), 'substance atlas interactive comparison regressed');
assert(interactionBrowser.includes('عدم ظهور تفاعل يعني «غير مراجع بعد» وليس «آمناً»'), 'interaction absence safety rule regressed');

console.log('addiction-atlas-product-contract: PASS | hub + sector discovery + interactive comparison + interaction safety');
