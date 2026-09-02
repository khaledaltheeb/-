const base = (process.env.PUBLIC_API_TEST_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');

function fail(message) { throw new Error(`PUBLIC API FEED CONTRACT FAILED: ${message}`); }

async function get(path, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${base}${path}`, { signal: controller.signal, redirect: 'error', headers: { Accept: '*/*' } });
  } finally {
    clearTimeout(timer);
  }
}

const rss = await get('/feed.xml');
if (rss.status !== 200) fail(`/feed.xml expected 200, got ${rss.status}`);
if (rss.headers.get('x-rawafid-feed-status') !== 'ok') fail('/feed.xml status header is not ok');
if (!(rss.headers.get('content-type') || '').includes('application/rss+xml')) fail('/feed.xml content type invalid');
const rssText = await rss.text();
if (!rssText.startsWith('<?xml') || !rssText.includes('<rss') || !rssText.includes('<channel>')) fail('/feed.xml XML structure invalid');
if (!rssText.includes('https://healthrenewal.org')) fail('/feed.xml canonical origin missing');

const jsonFeed = await get('/feed.json');
if (jsonFeed.status !== 200) fail(`/feed.json expected 200, got ${jsonFeed.status}`);
if (jsonFeed.headers.get('x-rawafid-feed-status') !== 'ok') fail('/feed.json status header is not ok');
if (!(jsonFeed.headers.get('content-type') || '').includes('application/feed+json')) fail('/feed.json content type invalid');
const feedBody = await jsonFeed.json();
if (feedBody?.version !== 'https://jsonfeed.org/version/1.1') fail('/feed.json is not JSON Feed 1.1');
if (feedBody?.feed_url !== 'https://healthrenewal.org/feed.json') fail('/feed.json canonical feed URL invalid');
if (!Array.isArray(feedBody?.items)) fail('/feed.json items missing');

const magazine = await get('/magazine/feed.xml');
if (magazine.status !== 200) fail(`/magazine/feed.xml expected 200, got ${magazine.status}`);
if (!(magazine.headers.get('content-type') || '').includes('application/rss+xml')) fail('/magazine/feed.xml content type invalid');
const magazineText = await magazine.text();
if (!magazineText.includes('<rss') || !magazineText.includes('<channel>')) fail('/magazine/feed.xml XML structure invalid');

console.log('PUBLIC API FEED CONTRACT OK');
