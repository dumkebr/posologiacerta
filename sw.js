// sw.js — PosologiaCerta (força atualização de cache)
const CACHE_NAME = 'pc-v2'; // << troquei v1 -> v2 para invalidar cache antigo
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-512.png',
  './posologiacerta-bundle-v0.10-beta2-BR.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : Promise.resolve()));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  e.respondWith((async () => {
    // cache-first, mas atualiza quando vier da rede
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(req);
    const fetchPromise = fetch(req).then((res) => {
      try { cache.put(req, res.clone()); } catch {}
      return res;
    }).catch(() => cached);
    return cached || fetchPromise;
  })());
});
