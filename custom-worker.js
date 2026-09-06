import { WorkerEntrypoint } from 'cloudflare:workers';

// OpenNext generates this module during the production build.
// The custom worker is the supported adapter pattern for reusing its fetch handler.
// @ts-ignore generated at build time
import handler from './.open-next/worker.js';

const CANONICAL_HOST = 'healthrenewal.org';
const WWW_HOST = 'www.healthrenewal.org';
const CACHEABLE_METHODS = new Set(['GET', 'HEAD']);

// These routes are intentionally kept on the uncached gateway path. This avoids a
// cache lookup for authentication/session traffic and for endpoints whose responses
// are explicitly dynamic/private. All other anonymous canonical GET/HEAD requests
// are allowed to reach the cached OpenNext backend, where the response Cache-Control
// header remains the final authority over whether Cloudflare stores the response.
const UNCACHED_PREFIXES = [
  '/account',
  '/admin',
  '/api',
  '/appointments',
  '/auth',
  '/center',
  '/dashboard',
  '/forgot-password',
  '/login',
  '/magazine',
  '/messages',
  '/mfa',
  '/notifications',
  '/register',
  '/reset-password',
  '/specialist',
  '/specialists-partners/account',
  '/specialists-partners/admin',
  '/specialists-partners/portal',
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

export class OpenNextBackend extends WorkerEntrypoint {
  async fetch(request) {
    return handler.fetch(request, this.env, this.ctx);
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Keep canonical-host consolidation outside the cached backend. Workers Cache
    // does not include the hostname in its key, so this prevents www and apex traffic
    // from ever sharing a cached representation.
    if (url.hostname.toLowerCase() === WWW_HOST) {
      url.protocol = 'https:';
      url.hostname = CANONICAL_HOST;
      url.port = '';
      return Response.redirect(url.toString(), 308);
    }

    // Staging/preview hosts, authenticated traffic, mutation methods, auth pages and
    // dynamic APIs execute OpenNext directly. The gateway itself is configured with
    // cache disabled, so these requests can never be satisfied by a public cache hit.
    if (shouldBypassPublicCache(request, url)) {
      return handler.fetch(request, env, ctx);
    }

    // ctx.props participates in the Workers Cache key. Keeping a stable anonymous
    // audience marker makes the cache namespace explicit and prevents future internal
    // callers with different authorization context from colliding with public HTML.
    const backend = ctx.exports.OpenNextBackend({
      props: { audience: 'anonymous-public' },
    });

    return backend.fetch(request);
  },
};
