import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { gzip, gunzip } from 'node:zlib';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);
const cacheVersion = 1;
const cacheDir = process.env.SEO_GATE_CACHE_DIR || '.seo-gate-cache';

export const SEO_SHARED_USER_AGENT =
  process.env.SEO_GATE_USER_AGENT ||
  'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)';

const stats = {
  hits: 0,
  misses: 0,
  writes: 0,
  corrupt: 0,
};

function cacheKey(url, userAgent) {
  return crypto
    .createHash('sha256')
    .update(`${cacheVersion}\n${userAgent}\n${url}`)
    .digest('hex');
}

function cachePath(url, userAgent) {
  return path.join(cacheDir, `${cacheKey(url, userAgent)}.json.gz`);
}

function isValidRecord(record, url, userAgent) {
  return Boolean(
    record &&
      record.version === cacheVersion &&
      record.url === url &&
      record.userAgent === userAgent &&
      Number.isInteger(record.status) &&
      typeof record.text === 'string',
  );
}

export async function readSeoSharedCache(url, userAgent = SEO_SHARED_USER_AGENT) {
  const file = cachePath(url, userAgent);
  try {
    const compressed = await fs.readFile(file);
    const raw = await gunzipAsync(compressed);
    const record = JSON.parse(raw.toString('utf8'));
    if (!isValidRecord(record, url, userAgent)) {
      stats.corrupt += 1;
      return null;
    }
    stats.hits += 1;
    return record;
  } catch (error) {
    if (error?.code !== 'ENOENT') stats.corrupt += 1;
    stats.misses += 1;
    return null;
  }
}

export async function writeSeoSharedCache(
  url,
  {
    userAgent = SEO_SHARED_USER_AGENT,
    status,
    finalUrl = url,
    contentType = '',
    text,
  },
) {
  if (!Number.isInteger(status) || typeof text !== 'string') return;
  await fs.mkdir(cacheDir, { recursive: true });
  const file = cachePath(url, userAgent);
  const tmp = `${file}.${process.pid}.${crypto.randomBytes(6).toString('hex')}.tmp`;
  const record = {
    version: cacheVersion,
    url,
    userAgent,
    status,
    finalUrl,
    contentType,
    text,
  };
  const compressed = await gzipAsync(Buffer.from(JSON.stringify(record), 'utf8'), { level: 6 });
  await fs.writeFile(tmp, compressed);
  await fs.rename(tmp, file);
  stats.writes += 1;
}

export function sharedCacheRecordToFetchResult(record) {
  const contentType = record.contentType || '';
  return {
    response: {
      status: record.status,
      ok: record.status >= 200 && record.status < 300,
      url: record.finalUrl || record.url,
      headers: {
        get(name) {
          return String(name).toLowerCase() === 'content-type' ? contentType : null;
        },
      },
    },
    text: record.text,
    cacheHit: true,
  };
}

export function getSeoSharedCacheStats() {
  return { ...stats };
}
