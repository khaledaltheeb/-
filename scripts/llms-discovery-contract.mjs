import fs from 'node:fs';

const file = 'public/llms.txt';
const body = fs.readFileSync(file, 'utf8');
const failures = [];

if (!/^#\s+\S+/m.test(body)) failures.push('llms.txt must contain at least one H1 heading');

const markdownLinks = [...body.matchAll(/\[[^\]]+\]\((https:\/\/[^)]+)\)/g)].map((match) => match[1]);
if (markdownLinks.length === 0) failures.push('llms.txt must contain at least one valid HTTPS Markdown link');

for (const required of [
  'https://healthrenewal.org/',
  'https://healthrenewal.org/sitemap.xml',
  'https://healthrenewal.org/robots.txt',
  'https://healthrenewal.org/feed.xml',
]) {
  if (!markdownLinks.includes(required)) failures.push(`llms.txt missing required Markdown link: ${required}`);
}

const duplicates = markdownLinks.filter((url, index) => markdownLinks.indexOf(url) !== index);
if (duplicates.length) failures.push(`llms.txt contains duplicate Markdown links: ${[...new Set(duplicates)].join(', ')}`);

if (failures.length) {
  console.error('LLMS DISCOVERY CONTRACT FAILED');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`llms.txt discovery contract passed: ${markdownLinks.length} Markdown links.`);
