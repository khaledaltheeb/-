import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const entry = 'app/rawafid-theme-v7-1.css';
const errors = [];
const visited = new Set();
const active = [];
const parents = new Map();

const fail = (message) => {
  errors.push(message);
  console.error(`THEME GRAPH CHECK FAILED: ${message}`);
  process.exitCode = 1;
};

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const normalizeImport = (fromFile, request) => path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), request));

function localCssImports(file) {
  const source = read(file);
  return [...source.matchAll(/@import\s+(?:url\()?['"]([^'"]+\.css)['"]\)?\s*;/g)]
    .map((match) => match[1])
    .filter((request) => request.startsWith('.'))
    .map((request) => normalizeImport(file, request));
}

function walk(file, parent = null) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) {
    fail(`missing stylesheet ${file}${parent ? ` imported from ${parent}` : ''}`);
    return;
  }

  if (parent) {
    const existingParents = parents.get(file) ?? new Set();
    existingParents.add(parent);
    parents.set(file, existingParents);
  }

  const cycleIndex = active.indexOf(file);
  if (cycleIndex !== -1) {
    fail(`cyclic stylesheet import: ${[...active.slice(cycleIndex), file].join(' -> ')}`);
    return;
  }
  if (visited.has(file)) return;

  active.push(file);
  for (const child of localCssImports(file)) walk(child, file);
  active.pop();
  visited.add(file);
}

walk(entry);

for (const [file, importingParents] of parents) {
  if (importingParents.size > 1) {
    fail(`stylesheet ${file} is reached from multiple parents: ${[...importingParents].sort().join(', ')}`);
  }
}

for (const required of [
  'app/rawafid-theme-v7-1.css',
  'app/rawafid-theme-v7.css',
  'app/rawafid-theme-v6.css',
  'app/rawafid-theme.css',
]) {
  if (!visited.has(required)) fail(`active public theme chain does not reach ${required}`);
}

const trackedBuildPrefixes = ['.next/', '.open-next/', '.wrangler/', 'out/', 'bundled/'];
try {
  const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' })
    .split(/\r?\n/)
    .filter(Boolean);
  const trackedBuildArtifacts = tracked.filter((file) => trackedBuildPrefixes.some((prefix) => file.startsWith(prefix)));
  if (trackedBuildArtifacts.length) {
    fail(`tracked build artifacts found: ${trackedBuildArtifacts.slice(0, 20).join(', ')}`);
  }
} catch (error) {
  fail(`unable to inspect tracked build artifacts: ${error instanceof Error ? error.message : String(error)}`);
}

const finalTheme = read(entry);
for (const forbidden of [
  '.footer-trust-list',
  '.footer-trust-note',
]) {
  if (finalTheme.includes(forbidden)) fail(`final rendering layer reintroduces removed footer selector ${forbidden}`);
}

if (!process.exitCode) {
  console.log(`Rawafid theme graph passed: ${visited.size} reachable stylesheets, no cycles, duplicate parents or tracked build artifacts.`);
}
