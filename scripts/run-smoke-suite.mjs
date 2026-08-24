import './smoke-fetch-resilience.mjs';

const suites = [
  './smoke.mjs',
  './legacy-preservation-smoke.mjs',
  './legacy-landing-integration-smoke.mjs',
  './historical-functional-parity-smoke.mjs',
  './care-guides-wave-004-smoke.mjs',
  './v7-critical-guide-rewrites-001-smoke.mjs',
];

for (const suite of suites) {
  await import(suite);
  if (process.exitCode && process.exitCode !== 0) {
    throw new Error(`Smoke suite failed in ${suite}`);
  }
}

console.log('Rawafid complete production smoke suite passed.');
