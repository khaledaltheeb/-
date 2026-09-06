import fs from 'node:fs';

const semantic = fs.readFileSync('lib/semantic-seo.ts', 'utf8');
const fail = (message) => {
  console.error(`SEMANTIC DOMAIN PRECISION CONTRACT FAILED: ${message}`);
  process.exitCode = 1;
};

for (const marker of [
  "const path = input.path.toLowerCase()",
  "const text = [input.title,input.description || '',...(input.keywords || []),...(input.relatedTerms || [])]",
  "addiction-recovery",
  "substance use",
  "تعاطي",
  "consumo de sustancias",
  "mental-health|psychology|psychiatry|anxiety|depression|trauma",
]) {
  if (!semantic.includes(marker)) fail(`missing precision marker: ${marker}`);
}

if (/addiction\|recovery\|substance/.test(semantic)) {
  fail('generic English recovery must not independently classify a page as addiction');
}
if (/إدمان\|التعافي\|تعاطي/.test(semantic)) {
  fail('generic Arabic التعافي must not independently classify a page as addiction');
}
if (semantic.includes("addiction: ['addiction','recovery','substance use disorders'")) {
  fail('generic English recovery must not be a primary addiction domain seed');
}
if (semantic.includes("addiction: ['الإدمان','التعافي','اضطرابات استخدام المواد'")) {
  fail('generic Arabic التعافي must not be a primary addiction domain seed');
}
if (semantic.includes("addiction: ['adicción','recuperación','trastornos por consumo de sustancias'")) {
  fail('generic Spanish recuperación must not be a primary addiction domain seed');
}

for (const marker of [
  "'mental-health': ['الصحة النفسية'",
  "'التعافي','منع الانتكاس'",
  "addiction: ['الإدمان','اضطرابات استخدام المواد','تعاطي المواد'",
  "addiction: ['addiction','substance use disorders','substance use'",
  "addiction: ['adicción','trastornos por consumo de sustancias','consumo de sustancias'",
]) {
  if (!semantic.includes(marker)) fail(`expected domain vocabulary marker missing: ${marker}`);
}

if (!process.exitCode) console.log('Semantic domain precision contract passed: route families lead and generic recovery language cannot imply addiction by itself.');
