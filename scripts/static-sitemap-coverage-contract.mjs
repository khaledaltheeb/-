import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const appRoot = 'app';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('STATIC SITEMAP COVERAGE CONTRACT FAILED: Supabase public environment is not configured.');
  process.exit(1);
}

function walk(dir, predicate, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, predicate, out);
    else if (predicate(full)) out.push(full);
  }
  return out;
}

function pageRoute(file) {
  const relative = path.relative(appRoot, path.dirname(file)).split(path.sep).filter(Boolean);
  if (relative.some((segment) => segment.includes('['))) return null;
  const visible = relative.filter((segment) => !(segment.startsWith('(') && segment.endsWith(')')));
  return visible.length ? `/${visible.join('/')}` : '/';
}

function normalizeRoute(value) {
  if (!value || typeof value !== 'string') return null;
  try {
    const parsed = new URL(value, 'https://healthrenewal.org');
    if (!['healthrenewal.org', 'www.healthrenewal.org'].includes(parsed.hostname.toLowerCase())) return null;
    const pathname = decodeURIComponent(parsed.pathname).replace(/\/{2,}/g, '/');
    return pathname === '/' ? '/' : pathname.replace(/\/$/, '');
  } catch {
    return null;
  }
}

function variants(route) {
  if (route === '/') return ["'/'", '"/"'];
  return [
    `'${route}'`, `"${route}"`, `\`${route}\``,
    `'${route}/'`, `"${route}/"`, `\`${route}/\``,
  ];
}

function coveredByGeneratedFamily(route) {
  // These child routes are emitted from dedicated data-driven sitemap routes rather than
  // hard-coded as one literal per page. Bracket routes are already excluded above.
  return route.startsWith('/cognitive-lab/') ||
    route.startsWith('/sectors/') ||
    route.startsWith('/sections/') ||
    route.startsWith('/daily-tools/');
}

function hasDynamicMetadata(source) {
  return /export\s+(?:async\s+)?function\s+generateMetadata\s*\(/.test(source);
}

function hasDataDrivenIndexability(source) {
  // Examples: index: record.robots_index or index: page.robots_index. Literal true/false
  // remains statically auditable and must not be skipped here.
  return /index\s*:\s*(?!true\b|false\b)[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+/.test(source);
}

async function dbBackedContentCanonicals() {
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const now = new Date().toISOString();
  const routes = new Set();
  const batchSize = 1000;

  for (let start = 0; start < 20000; start += batchSize) {
    const { data, error } = await supabase
      .from('content')
      .select('canonical_url')
      .eq('status', 'published')
      .neq('content_type', 'condition')
      .eq('robots_index', true)
      .lte('published_at', now)
      .order('id', { ascending: true })
      .range(start, start + batchSize - 1);
    if (error) throw new Error(error.message);
    const batch = Array.isArray(data) ? data : [];
    for (const row of batch) {
      const route = normalizeRoute(row.canonical_url);
      if (route) routes.add(route);
    }
    if (batch.length < batchSize) break;
  }
  return routes;
}

const pageFiles = walk(appRoot, (file) => /\/page\.(?:ts|tsx)$/.test(file.replaceAll('\\', '/')));
const sitemapFiles = [
  'app/sitemap.xml/route.ts',
  ...walk('app/sitemaps', (file) => /\/route\.(?:ts|tsx)$/.test(file.replaceAll('\\', '/'))),
];
const sitemapSource = sitemapFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const dbCanonicals = await dbBackedContentCanonicals();

const candidates = [];
for (const file of pageFiles) {
  const route = pageRoute(file);
  if (!route) continue;
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes('buildSeoMetadata')) continue;
  if (/index\s*:\s*false/.test(source)) continue;
  const normalizedRoute = normalizeRoute(route) || route;

  // A route whose index flag comes from the live content record is covered if and only if
  // that live record is indexable. If no indexable canonical exists now, do not force an
  // intentionally noindex data-driven page into the static sitemap merely to satisfy CI.
  if (hasDynamicMetadata(source) && hasDataDrivenIndexability(source) && !dbCanonicals.has(normalizedRoute)) continue;

  candidates.push({ file, route: normalizedRoute });
}

const missing = candidates.filter(({ route }) => {
  if (coveredByGeneratedFamily(route)) return false;
  if (dbCanonicals.has(route)) return false;
  return !variants(route).some((variant) => sitemapSource.includes(variant));
});

// Bracket routes need an explicit generated-family check because pageRoute deliberately
// skips them. Infographic details are indexable; worksheet details are deliberately noindex.
const staticSitemap = fs.readFileSync('app/sitemaps/static.xml/route.ts', 'utf8');
const infographicDetail = fs.readFileSync('app/resources/infographics/[slug]/page.tsx', 'utf8');
const worksheetDetail = fs.readFileSync('app/resources/worksheets/[slug]/page.tsx', 'utf8');
if (/index\s*:\s*true/.test(infographicDetail)) {
  if (!staticSitemap.includes("import { infographics } from '@/lib/practical-resources'")) {
    missing.push({ route: '/resources/infographics/[slug]', file: 'app/resources/infographics/[slug]/page.tsx — sitemap must import infographics' });
  }
  if (!staticSitemap.includes('`/resources/infographics/${item.slug}`')) {
    missing.push({ route: '/resources/infographics/[slug]', file: 'app/resources/infographics/[slug]/page.tsx — generated sitemap URLs missing' });
  }
}
if (/index\s*:\s*true/.test(worksheetDetail)) {
  missing.push({ route: '/resources/worksheets/[slug]', file: 'app/resources/worksheets/[slug]/page.tsx — unexpectedly became indexable without sitemap coverage' });
}

if (missing.length) {
  console.error(`STATIC SITEMAP COVERAGE CONTRACT FAILED: ${missing.length} indexable route(s) are absent from static/generated/DB-backed sitemap coverage.`);
  for (const item of missing) console.error(`- ${item.route} (${item.file})`);
  process.exit(1);
}

console.log(`Static sitemap coverage contract passed: ${candidates.length} indexable static routes are represented by literal, generated-family, or DB-backed sitemap coverage, with generated practical-resource details audited explicitly.`);
