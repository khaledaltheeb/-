import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const expectedAssets = [
  'public/images/og/addiction-recovery.png',
  'public/images/og/capabilities.png',
  'public/images/og/comparisons.png',
  'public/images/og/family-guide.png',
];
const redirectRoutes = [
  'app/addiction/images/[slug]/route.tsx',
  'app/capabilities/[slug]/cover/route.tsx',
  'app/capabilities/cover/route.tsx',
  'app/comparisons/[slug]/cover/route.tsx',
  'app/comparisons/cover/route.tsx',
  'app/family-guide/images/[slug]/route.tsx',
];

const failures = [];
for (const relativePath of expectedAssets) {
  const bytes = await readFile(path.join(root, relativePath));
  const signature = bytes.subarray(0, 8).toString('hex');
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (signature !== '89504e470d0a1a0a') failures.push(`${relativePath}: invalid PNG signature`);
  if (width !== 1200 || height !== 675) failures.push(`${relativePath}: expected 1200x675, got ${width}x${height}`);
  if (bytes.length < 10_000 || bytes.length > 700_000) failures.push(`${relativePath}: unexpected byte size ${bytes.length}`);
}

for (const relativePath of redirectRoutes) {
  const source = await readFile(path.join(root, relativePath), 'utf8');
  if (!source.includes('staticOgRedirect')) failures.push(`${relativePath}: static redirect contract missing`);
  if (/next\/og|ImageResponse|OgImage|get(?:Capability|Comparison)Record|createClient/.test(source)) {
    failures.push(`${relativePath}: request-time image generation or database access is forbidden`);
  }
}

for (const removedRoute of ['app/capabilities/opengraph-image.tsx', 'app/capabilities/[slug]/opengraph-image.tsx']) {
  try {
    await access(path.join(root, removedRoute));
    failures.push(`${removedRoute}: dynamic metadata image route must remain removed`);
  } catch {
    // Expected: page metadata points to the stable cover URL instead.
  }
}

if (failures.length) {
  console.error('Static OG asset contract failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Rawafid static OG asset contract passed.');
