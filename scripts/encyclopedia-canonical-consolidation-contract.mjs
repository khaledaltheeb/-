import { readFile } from 'node:fs/promises';

const config = await readFile('next.config.ts', 'utf8');

const requiredRedirects = [
  ['/encyclopedia/cluttering-communication-disorder', '/encyclopedia/cluttering/'],
  ['/encyclopedia/cluttering-communication-disorder/', '/encyclopedia/cluttering/'],
  ['/content/cluttering-fluency-disorder', '/encyclopedia/cluttering/'],
  ['/content/cluttering-fluency-disorder/', '/encyclopedia/cluttering/'],
];

const failures = [];
for (const [source, destination] of requiredRedirects) {
  const sourceMarker = `source: '${source}'`;
  const destinationMarker = `destination: '${destination}'`;
  const sourceIndex = config.indexOf(sourceMarker);
  if (sourceIndex === -1) {
    failures.push(`missing redirect source ${source}`);
    continue;
  }

  const block = config.slice(sourceIndex, sourceIndex + 260);
  if (!block.includes(destinationMarker)) failures.push(`${source} does not point to ${destination}`);
  if (!block.includes('permanent: true')) failures.push(`${source} is not permanent`);
}

if (failures.length) {
  console.error('Encyclopedia canonical-consolidation contract failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Canonical consolidation contract passed for ${requiredRedirects.length} Cluttering route variants.`);
