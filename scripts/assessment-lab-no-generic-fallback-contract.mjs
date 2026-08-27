import fs from 'node:fs';

const catalog = fs.readFileSync('lib/assessment-lab/catalog.ts', 'utf8');
const monitors = JSON.parse(fs.readFileSync('data/assessment-lab/monitors.v1.json', 'utf8'));

const fail = (message) => {
  console.error(`ASSESSMENT NO-GENERIC-FALLBACK FAILED: ${message}`);
  process.exitCode = 1;
};

if (catalog.includes('function questionsForAxis')) fail('generic axis question generator must not exist');
if (catalog.includes('function inferResponseKind')) fail('response semantics must not be inferred from wording');
if (!catalog.includes('throw new Error(`Missing tailored Assessment Lab question bank for ${monitor.slug}`)')) fail('missing tailored banks must fail closed');
if (monitors.length !== 60) fail(`active Rawafid monitor count must remain 60, found ${monitors.length}`);

if (!process.exitCode) console.log('Assessment no-generic-fallback gate passed: all active monitors require tailored banks and explicit response semantics.');
