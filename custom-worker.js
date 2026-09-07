import { WorkerEntrypoint } from 'cloudflare:workers';

import handler from './.open-next/worker.js';

const CANONICAL_HOST = 'healthrenewal.org';
const WWW_HOST = 'www.healthrenewal.org';
const CACHEABLE_METHODS = new Set(['GET', 'HEAD']);
const KIDS_LAB_PREFIX = '/capabilities/kids-lab';
const WORKSHEETS_PREFIX = '/resources/worksheets';
const DYSLEXIA_TOOLKIT_PATH = '/evidence-guides/dyslexia-norway-school-observation-toolkit';
// Kids Lab and selected practical resources are materialized by the exact production OpenNext build before this gateway serves them.

const ROBOTS_TXT = [
  'User-agent: *',
  'Allow: /',
  '',
  'Sitemap: https://healthrenewal.org/sitemap.xml',
  'Host: healthrenewal.org',
  '',
].join('\n');

const ROBOTS_HEADERS = {
  'Content-Type': 'text/plain; charset=utf-8',
  'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'all',
  'Access-Control-Allow-Origin': '*',
};

const UNCACHED_PREFIXES = [
  '/account','/admin','/api','/appointments','/auth','/center','/dashboard','/forgot-password','/login','/magazine','/messages','/mfa','/notifications','/register','/reset-password','/specialist','/specialists-partners/account','/specialists-partners/admin','/specialists-partners/portal',
];

function isPrefix(pathname, prefix) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function hasSupabaseAuthCookie(request) {
  const header = request.headers.get('cookie');
  if (!header) return false;
  return header.split(';').some((part) => {
    const separator = part.indexOf('=');
    const name = (separator === -1 ? part : part.slice(0, separator)).trim();
    return name.startsWith('sb-') && name.includes('-auth-token');
  });
}

function shouldBypassPublicCache(request, url) {
  if (url.hostname !== CANONICAL_HOST) return true;
  if (!CACHEABLE_METHODS.has(request.method)) return true;
  if (hasSupabaseAuthCookie(request)) return true;
  return UNCACHED_PREFIXES.some((prefix) => isPrefix(url.pathname, prefix));
}

function robotsResponse(request) {
  const body = request.method === 'HEAD' ? null : ROBOTS_TXT;
  return new Response(body, { status: 200, headers: ROBOTS_HEADERS });
}

function kidsLabWorksheetAssetPath(pathname) {
  const flat = pathname.match(/^\/capabilities\/kids-lab\/bilateral-tracks\/([^/]+)\/image\/?$/);
  if (flat) return `/kids-lab-assets/bilateral-tracks/${flat[1]}.svg`;
  const nested = pathname.match(/^\/capabilities\/kids-lab\/([^/]+)\/([^/]+)\/([^/]+)\/image\/?$/);
  if (!nested) return null;
  return `/kids-lab-assets/${nested[1]}/${nested[2]}/${nested[3]}.svg`;
}

function isRscRequest(request, url) {
  return request.headers.get('rsc') === '1' || url.searchParams.has('_rsc');
}

async function assetFetch(request, env, pathname) {
  if (!env.ASSETS) return null;
  const target = new URL(request.url);
  target.pathname = pathname;
  target.search = '';
  const assetRequest = new Request(target.toString(), { method: request.method, headers: request.headers });
  const response = await env.ASSETS.fetch(assetRequest);
  return response.status === 404 ? null : response;
}

async function staticPageResponse(request, env, url, pathname) {
  if (url.hostname.toLowerCase() !== CANONICAL_HOST || !CACHEABLE_METHODS.has(request.method)) return null;
  const normalized = pathname.endsWith('/') ? pathname : `${pathname}/`;
  if (isRscRequest(request, url)) return assetFetch(request, env, `${normalized}index.rsc`);
  const accept = (request.headers.get('accept') || '').toLowerCase();
  if (!accept.includes('text/html') && !accept.includes('*/*') && request.method !== 'HEAD') return null;
  // Ask Cloudflare Static Assets for the directory URL, not index.html directly.
  // With automatic HTML handling an explicit /index.html can redirect back to the
  // directory URL; serving the normalized route avoids a redirect loop and lets
  // the asset binding resolve the materialized index.html itself.
  return assetFetch(request, env, normalized);
}

async function kidsLabStaticResponse(request, env, url) {
  if (url.hostname.toLowerCase() !== CANONICAL_HOST || !CACHEABLE_METHODS.has(request.method)) return null;
  if (!isPrefix(url.pathname, KIDS_LAB_PREFIX)) return null;

  const worksheet = kidsLabWorksheetAssetPath(url.pathname);
  if (worksheet) return assetFetch(request, env, worksheet);
  return staticPageResponse(request, env, url, url.pathname);
}

async function practicalResourcesStaticResponse(request, env, url) {
  if (isPrefix(url.pathname, WORKSHEETS_PREFIX)) {
    return staticPageResponse(request, env, url, url.pathname);
  }
  const normalizedPath = url.pathname.endsWith('/') && url.pathname !== '/' ? url.pathname.slice(0, -1) : url.pathname;
  if (normalizedPath === DYSLEXIA_TOOLKIT_PATH) {
    return staticPageResponse(request, env, url, DYSLEXIA_TOOLKIT_PATH);
  }
  return null;
}

export class OpenNextBackend extends WorkerEntrypoint {
  async fetch(request) {
    return handler.fetch(request, this.env, this.ctx);
  }
}

const gateway = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.hostname.toLowerCase() === WWW_HOST) {
      url.protocol = 'https:';
      url.hostname = CANONICAL_HOST;
      url.port = '';
      return Response.redirect(url.toString(), 308);
    }

    if (url.hostname.toLowerCase() === CANONICAL_HOST && url.pathname === '/robots.txt' && CACHEABLE_METHODS.has(request.method)) {
      return robotsResponse(request);
    }

    const kidsLabStatic = await kidsLabStaticResponse(request, env, url);
    if (kidsLabStatic) return kidsLabStatic;

    const practicalStatic = await practicalResourcesStaticResponse(request, env, url);
    if (practicalStatic) return practicalStatic;

    if (shouldBypassPublicCache(request, url)) {
      return handler.fetch(request, env, ctx);
    }

    const backend = ctx.exports.OpenNextBackend({ props: { audience: 'anonymous-public' } });
    return backend.fetch(request);
  },
};

export default gateway;
