const CACHE_NAME = 'pc-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png',
  './posologiacerta-bundle-v0.10-beta2-BR.json'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE_NAME);
    await c.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : 0));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  e.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(e.request);
    try {
      const fresh = await fetch(e.request);
      try { cache.put(e.request, fresh.clone()); } catch {}
      return fresh;
    } catch {
      return cached || Response.error();
    }
  })());
});
