import { readFile } from 'node:fs/promises';

function assert(condition, message) {
  if (!condition) throw new Error(`addiction-atlas-product-contract: ${message}`);
}

const [hub, compare, sector, atlasBrowser, interactionBrowser, comparisonExplorer, evidenceStandards, adfLayer, substancePage, interactionsV3] = await Promise.all([
  readFile('components/addiction-atlas-hub-portal.tsx', 'utf8'),
  readFile('app/addiction/compare/page.tsx', 'utf8'),
  readFile('app/sectors/[slug]/page.tsx', 'utf8'),
  readFile('components/addiction-atlas-browser.tsx', 'utf8'),
  readFile('components/addiction-interaction-browser.tsx', 'utf8'),
  readFile('components/addiction-comparison-explorer.tsx', 'utf8'),
  readFile('app/addiction/evidence-standards/page.tsx', 'utf8'),
  readFile('lib/adf-addiction.ts', 'utf8'),
  readFile('app/addiction/substances/[slug]/page.tsx', 'utf8'),
  readFile('data/addiction-atlas/interactions-v3.json', 'utf8'),
]);

for (const route of ['/addiction/substances/', '/addiction/compare/', '/addiction/interactions/', '/addiction/prevalence/', '/addiction/mortality/', '/addiction/methodology/']) {
  assert(hub.includes(route), `hub missing primary route ${route}`);
  assert(sector.includes(route), `addiction sector missing primary route ${route}`);
}

assert(hub.includes('/addiction/evidence-standards/'), 'hub missing evidence standards route');
assert(hub.includes('مرجع ADF مباشر'), 'hub missing ADF cross-reference coverage signal');
assert(sector.includes("sector.slug === 'addiction-recovery'"), 'sector integration must stay scoped to addiction-recovery');
assert(compare.includes('AddictionComparisonExplorer'), 'comparison hub must render the interactive comparison explorer');
assert(compare.includes('صفحة مفهرسة لكل تركيبة ممكنة'), 'comparison hub must preserve anti-scaled-content editorial policy');
assert(compare.includes('ADF Drug Facts + Power of Words'), 'comparison hub missing external ADF cross-check layer');
assert(comparisonExplorer.includes('المقارنة السريرية والوصفية'), 'clinical descriptive comparison layer missing');
assert(comparisonExplorer.includes('علامات الطوارئ والاستجابة'), 'clinical comparison emergency row missing');
assert(comparisonExplorer.includes('تفاعلات مراجعة مرتبطة'), 'clinical comparison interaction coverage missing');
assert(atlasBrowser.includes('مقارنة تفاعلية بين مادتين'), 'substance atlas interactive comparison regressed');
assert(atlasBrowser.includes('مرجع ADF الموازٍ'), 'atlas ADF cross-reference filter missing');
assert(interactionBrowser.includes('عدم ظهور تفاعل يعني «غير مراجع بعد» وليس «آمناً»'), 'interaction absence safety rule regressed');
assert(interactionBrowser.includes('سجل التفاعلات المراجعة'), 'filterable reviewed interaction registry missing');
assert(interactionBrowser.includes('substanceFilter') && interactionBrowser.includes('severityFilter') && interactionBrowser.includes('scopeFilter'), 'interaction registry filters missing');
assert(interactionBrowser.includes('نطاق الدليل') && interactionBrowser.includes('قوة الدليل'), 'interaction registry evidence columns missing');
assert(evidenceStandards.includes('مصفوفة اكتمال الأطلس'), 'evidence coverage matrix missing');
assert(evidenceStandards.includes('لم ننقل جداول ADF أو نصوصها أو رسومها'), 'ADF copyright boundary missing');
assert(adfLayer.includes('لا تعني الإحالة إلى ADF أن المؤسسة راجعت درجات الأطلس أو اعتمدتها'), 'ADF non-endorsement provenance missing');
assert(substancePage.includes('getAdfDrugFactReference(item)'), 'substance pages missing direct ADF cross-reference lookup');
assert(substancePage.includes('مرجع ADF موازٍ لهذه المادة'), 'substance pages missing visible ADF cross-reference section');
assert(substancePage.includes('ADF_PROVENANCE_NOTE_AR'), 'substance pages missing ADF non-endorsement provenance');
assert(substancePage.includes('/addiction/evidence-standards/'), 'substance pages missing ADF methodology/copyright route');

const interactionData = JSON.parse(interactionsV3);
const interactionIds = new Set(interactionData.records.map((item) => item.id));
for (const required of ['alcohol-diazepam','heroin-diazepam','oxycodone-diazepam','fentanyl-ketamine','fentanyl-cocaine','fentanyl-methamphetamine','alcohol-cocaine','alcohol-methamphetamine','heroin-alcohol']) {
  assert(interactionIds.has(required), `reviewed interaction wave missing ${required}`);
}
assert(interactionData.records.length >= 12, `expected at least 12 interactions in v3, got ${interactionData.records.length}`);
const oxyDiazepam = interactionData.records.find((item) => item.id === 'oxycodone-diazepam');
assert(oxyDiazepam?.evidence_scope === 'class-to-class', 'oxycodone-diazepam must retain FDA class-to-class scope');
assert(interactionData.policy_ar.includes('غير مراجع بعد'), 'interaction wave must preserve unreviewed-not-safe policy');

console.log('addiction-atlas-product-contract: PASS | hub + sector discovery + substance ADF cross-reference + clinical comparison + reviewed interaction registry + evidence scope guards + ADF provenance + coverage matrix + interaction safety');
