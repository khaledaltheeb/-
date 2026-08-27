import { readFile, writeFile } from 'node:fs/promises';

async function patch(file, operations) {
  let text = await readFile(file, 'utf8');
  for (const [from, to] of operations) {
    const count = text.split(from).length - 1;
    if (count !== 1) throw new Error(`${file}: expected exactly one patch target, found ${count}: ${from.slice(0, 80)}`);
    text = text.replace(from, to);
  }
  await writeFile(file, text, 'utf8');
}

await patch('lib/addiction-atlas.ts', [
  [
    "import sourceRegistryV3Json from '@/data/addiction-atlas/source-registry-v3.json';",
    "import sourceRegistryV3Json from '@/data/addiction-atlas/source-registry-v3.json';\nimport sourceRegistryV4Json from '@/data/addiction-atlas/source-registry-v4.json';\nimport sourceRegistryV5Json from '@/data/addiction-atlas/source-registry-v5.json';",
  ],
  [
    'const sourceRegistries = [sourceRegistryV1Json, sourceRegistryV2Json, sourceRegistryV3Json] as unknown as SourceRegistry[];',
    'const sourceRegistries = [sourceRegistryV1Json, sourceRegistryV2Json, sourceRegistryV3Json, sourceRegistryV4Json, sourceRegistryV5Json] as unknown as SourceRegistry[];',
  ],
]);

await patch('lib/addiction-atlas-evidence.ts', [
  [
    "import riskEvidenceV7Json from '@/data/addiction-atlas/risk-evidence-v7.json';",
    "import riskEvidenceV7Json from '@/data/addiction-atlas/risk-evidence-v7.json';\nimport riskEvidenceV8Json from '@/data/addiction-atlas/risk-evidence-v8.json';",
  ],
  [
    'const files = [riskEvidenceV4Json, riskEvidenceV5Json, riskEvidenceV6Json, riskEvidenceV7Json] as unknown as RiskEvidenceFile[];',
    'const files = [riskEvidenceV4Json, riskEvidenceV5Json, riskEvidenceV6Json, riskEvidenceV7Json, riskEvidenceV8Json] as unknown as RiskEvidenceFile[];',
  ],
]);

await patch('scripts/addiction-atlas-contract.mjs', [
  [
    "const WAVE7_SLUGS = ['7-hydroxymitragynine','phenibut','hexahydrocannabinol-hhc','carisoprodol','protonitazepyne','metonitazepyne','etonitazepipne','n-desethyl-isotonitazene','3-oh-pcp','n-ethylheptedrone','isotonitazepyne','n-desethyl-etonitazene','mdmb-fubinaca','cychlorphine'];",
    "const WAVE7_SLUGS = ['7-hydroxymitragynine','phenibut','hexahydrocannabinol-hhc','carisoprodol','protonitazepyne','metonitazepyne','etonitazepipne','n-desethyl-isotonitazene','3-oh-pcp','n-ethylheptedrone','isotonitazepyne','n-desethyl-etonitazene','mdmb-fubinaca','cychlorphine'];\nconst WAVE8_EVIDENCE_SLUGS = ['fentanyl','heroin','cocaine','methamphetamine','cannabis','alcohol','nicotine','synthetic-cannabinoids','morphine','oxycodone','tramadol','methadone','alprazolam','diazepam','amphetamine','mdma','ketamine','ghb','buprenorphine','nitazenes'];",
  ],
  [
    'sourceRegistryV1, sourceRegistryV2, sourceRegistryV3,\n  riskEvidenceV4, riskEvidenceV5, riskEvidenceV6, riskEvidenceV7,',
    'sourceRegistryV1, sourceRegistryV2, sourceRegistryV3, sourceRegistryV4, sourceRegistryV5,\n  riskEvidenceV4, riskEvidenceV5, riskEvidenceV6, riskEvidenceV7, riskEvidenceV8,',
  ],
  [
    "json('source-registry-v3.json'),\n  json('risk-evidence-v4.json'),",
    "json('source-registry-v3.json'),\n  json('source-registry-v4.json'),\n  json('source-registry-v5.json'),\n  json('risk-evidence-v4.json'),",
  ],
  [
    "json('risk-evidence-v7.json'),\n]);",
    "json('risk-evidence-v7.json'),\n  json('risk-evidence-v8.json'),\n]);",
  ],
  [
    'const sources = [...(sourceRegistryV1.sources || []), ...(sourceRegistryV2.sources || []), ...(sourceRegistryV3.sources || [])];',
    'const sources = [...(sourceRegistryV1.sources || []), ...(sourceRegistryV2.sources || []), ...(sourceRegistryV3.sources || []), ...(sourceRegistryV4.sources || []), ...(sourceRegistryV5.sources || [])];',
  ],
  [
    "for (const required of ['fda-tianeptine-2025','cdc-carfentanil-mmwr-2024','cdc-medetomidine-han-2026','who-ecdd47-report-2025','who-cnd-nps-control-2025','who-cnd-nps-control-2026','fda-7oh-update-2026','euda-cychlorphine-initial-2026','fda-opioid-cns-depressant-warning-2016']) assert(sourceIds.has(required), `required extension source missing: ${required}`);",
    "for (const required of ['fda-tianeptine-2025','cdc-carfentanil-mmwr-2024','cdc-medetomidine-han-2026','who-ecdd47-report-2025','who-cnd-nps-control-2025','who-cnd-nps-control-2026','fda-7oh-update-2026','euda-cychlorphine-initial-2026','fda-opioid-cns-depressant-warning-2016','nida-fentanyl-2025','nida-cocaine-current','nida-methamphetamine-current','nida-cannabis-current','fda-opioid-labeling-2023','fda-methadone-label-2025','fda-tramadol-label-2023','who-drug-withdrawal-mhgap','who-alcohol-withdrawal-mhgap','euda-edr-2026-mdma','who-ghb-ecdd-2013','samhsa-buprenorphine-2026','nida-synthetic-cannabinoids-current']) assert(sourceIds.has(required), `required extension source missing: ${required}`);",
  ],
  [
    'const axisEvidence = [...(riskEvidenceV4.records || []), ...(riskEvidenceV5.records || []), ...(riskEvidenceV6.records || []), ...(riskEvidenceV7.records || [])];',
    'const axisEvidence = [...(riskEvidenceV4.records || []), ...(riskEvidenceV5.records || []), ...(riskEvidenceV6.records || []), ...(riskEvidenceV7.records || []), ...(riskEvidenceV8.records || [])];',
  ],
  [
    'assert(axisEvidence.length >= 35, `expected at least 35 axis-evidence substances, got ${axisEvidence.length}`);\nassert(axisEvidence.length * RISK_KEYS.length >= 280, \'expected at least 280 axis-evidence cells\');\nfor (const slug of [...WAVE6_SLUGS, ...WAVE7_SLUGS]) assert(evidenceSlugs.has(slug), `extension substance missing axis evidence: ${slug}`);',
    'assert(axisEvidence.length >= 55, `expected at least 55 axis-evidence substances, got ${axisEvidence.length}`);\nassert(axisEvidence.length * RISK_KEYS.length >= 440, \'expected at least 440 axis-evidence cells\');\nfor (const slug of [...WAVE6_SLUGS, ...WAVE7_SLUGS, ...WAVE8_EVIDENCE_SLUGS]) assert(evidenceSlugs.has(slug), `extension substance missing axis evidence: ${slug}`);',
  ],
  [
    "assert(cychlorphineEvidence && RISK_KEYS.every((key) => cychlorphineEvidence.dimensions[key].score === null && cychlorphineEvidence.dimensions[key].evidence_grade === 'U'), 'cychlorphine axis evidence must remain U/null');",
    "assert(cychlorphineEvidence && RISK_KEYS.every((key) => cychlorphineEvidence.dimensions[key].score === null && cychlorphineEvidence.dimensions[key].evidence_grade === 'U'), 'cychlorphine axis evidence must remain U/null');\nconst nitazenesEvidence = axisEvidence.find((record) => record.substance_slug === 'nitazenes');\nassert(nitazenesEvidence?.dimensions.withdrawal_medical_risk?.score === null && nitazenesEvidence?.dimensions.withdrawal_medical_risk?.evidence_grade === 'U', 'nitazenes withdrawal must remain U/null until supported');\nconst methadoneEvidence = axisEvidence.find((record) => record.substance_slug === 'methadone');\nassert(methadoneEvidence?.dimensions.cardio_harm?.evidence_grade === 'A' && methadoneEvidence?.dimensions.cardio_harm?.source_ids?.includes('fda-methadone-label-2025'), 'methadone cardiac axis must retain FDA-specific QT evidence');\nconst tramadolEvidence = axisEvidence.find((record) => record.substance_slug === 'tramadol');\nassert(tramadolEvidence?.dimensions.neuro_harm?.evidence_grade === 'A' && tramadolEvidence?.dimensions.neuro_harm?.source_ids?.includes('fda-tramadol-label-2023'), 'tramadol neuro axis must retain seizure-specific FDA evidence');\nconst alcoholEvidence = axisEvidence.find((record) => record.substance_slug === 'alcohol');\nassert(alcoholEvidence?.dimensions.withdrawal_medical_risk?.evidence_grade === 'A' && alcoholEvidence?.dimensions.withdrawal_medical_risk?.source_ids?.includes('who-alcohol-withdrawal-mhgap'), 'alcohol withdrawal axis must retain WHO medical-withdrawal evidence');\nconst buprenorphineEvidence = axisEvidence.find((record) => record.substance_slug === 'buprenorphine');\nassert(buprenorphineEvidence && RISK_KEYS.some((key) => buprenorphineEvidence.dimensions[key].source_ids?.includes('samhsa-buprenorphine-2026')), 'buprenorphine evidence must preserve treatment-context source');",
  ],
]);

console.log('Wave 8 runtime and scientific contract patched.');
