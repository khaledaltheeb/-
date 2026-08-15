const CACHE_NAME = 'rawafid-shell-v6';
const PRECACHE = ['/offline', '/manifest.webmanifest', '/icons/rawafid-app.svg?v=6'];
const PRIVATE_PREFIXES = [
  '/account', '/admin', '/specialist', '/center', '/messages', '/appointments', '/notifications',
  '/auth', '/login', '/forgot-password', '/reset-password', '/community/join', '/api'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (PRIVATE_PREFIXES.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) return;

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => (await caches.match('/offline'))));
    return;
  }

  if (['style', 'script', 'image', 'font'].includes(request.destination)) {
    const responsePromise = caches.match(request).then((cached) => cached || fetch(request));
    const cacheWrite = responsePromise.then(async (response) => {
      if (!response || !response.ok || response.type !== 'basic') return;
      if (await caches.match(request)) return;
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    });
    event.respondWith(responsePromise);
    event.waitUntil(cacheWrite.catch(() => undefined));
  }
});
