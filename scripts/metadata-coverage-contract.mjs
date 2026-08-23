import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const APP = path.join(ROOT, 'app');
const failures = [];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function relative(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function hasManualStaticMetadata(source) {
  return /export\s+const\s+metadata(?:\s*:\s*Metadata)?\s*=\s*\{/s.test(source);
}

function explicitlyNoIndex(source) {
  return /robots\s*:\s*\{[\s\S]{0,400}?index\s*:\s*false/s.test(source);
}

function usesCentralSeo(source) {
  return source.includes('buildSeoMetadata(')
    || source.includes('legacyPreservedMetadata(')
    || source.includes('preservedRouteMetadata(')
    || source.includes('dailyToolMetadata(');
}

function hasDynamicMetadata(source) {
  return /export\s+(?:async\s+)?function\s+generateMetadata\s*\(/.test(source);
}

function dynamicMetadataLooksCentral(source) {
  return usesCentralSeo(source) || source.includes('contentMetadata(');
}

const pageFiles = walk(APP).filter((file) => file.endsWith(`${path.sep}page.tsx`) || file.endsWith(`${path.sep}page.ts`));
let publicCentral = 0;
let explicitNoindex = 0;
let dynamicPages = 0;

for (const file of pageFiles) {
  const source = fs.readFileSync(file, 'utf8');
  const name = relative(file);
  const manual = hasManualStaticMetadata(source);
  const dynamic = hasDynamicMetadata(source);
  const central = usesCentralSeo(source);
  const noindex = explicitlyNoIndex(source);

  if (noindex) explicitNoindex += 1;
  if (central) publicCentral += 1;
  if (dynamic) dynamicPages += 1;

  if (manual && !central && !noindex) {
    failures.push(`${name}: indexable/inherited static metadata bypasses buildSeoMetadata`);
  }
  if (dynamic && !dynamicMetadataLooksCentral(source) && !noindex) {
    failures.push(`${name}: generateMetadata does not use the centralized SEO path`);
  }

  // Any page explicitly asking for index:true must use the central SEO generator.
  if (/index\s*:\s*true/.test(source) && !central) {
    failures.push(`${name}: explicit index:true without buildSeoMetadata`);
  }
}

console.log(`Metadata coverage: pages=${pageFiles.length}, central=${publicCentral}, dynamic=${dynamicPages}, explicit-noindex=${explicitNoindex}, failures=${failures.length}`);
if (failures.length) {
  for (const failure of failures) console.error(`METADATA COVERAGE FAIL: ${failure}`);
  process.exit(1);
}
console.log('Metadata coverage contract: OK');
