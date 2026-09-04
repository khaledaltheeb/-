import crypto from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { gzip, gunzip } from 'node:zlib';
import { promisify } from 'node:util';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

export const SHARED_CRAWL_USER_AGENT = 'Rawafid-Quality-Crawl/1.0';
export const SHARED_HTML_CACHE_DIR = process.env.SEO_SHARED_HTML_CACHE_DIR || '/tmp/rawafid-seo-html-cache';

function cacheKey(url) {
  return crypto.createHash('sha256').update(`${SHARED_CRAWL_USER_AGENT}\u0000${url}`).digest('hex');
}

function cachePath(url) {
  return path.join(SHARED_HTML_CACHE_DIR, `${cacheKey(url)}.json.gz`);
}

export async function readSharedHtml(url) {
  try {
    const compressed = await readFile(cachePath(url));
    const payload = JSON.parse((await gunzipAsync(compressed)).toString('utf8'));
    if (payload?.version !== 1 || payload?.url !== url || payload?.userAgent !== SHARED_CRAWL_USER_AGENT) return null;
    if (payload?.status !== 200 || typeof payload?.html !== 'string') return null;
    return { status: 200, contentType: payload.contentType || 'text/html', responseUrl: payload.responseUrl || url, html: payload.html };
  } catch {
    return null;
  }
}

export async function writeSharedHtml(url, response, html) {
  if (!response || response.status !== 200 || typeof html !== 'string') return false;
  const contentType = response.headers?.get?.('content-type') || '';
  if (!contentType.includes('text/html')) return false;
  const payload = {
    version: 1,
    url,
    responseUrl: response.url || url,
    status: 200,
    contentType,
    userAgent: SHARED_CRAWL_USER_AGENT,
    html,
  };
  await mkdir(SHARED_HTML_CACHE_DIR, { recursive: true });
  const compressed = await gzipAsync(Buffer.from(JSON.stringify(payload), 'utf8'), { level: 6 });
  await writeFile(cachePath(url), compressed);
  return true;
}
