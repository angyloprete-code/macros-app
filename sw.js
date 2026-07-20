// Macro Fit — service worker
// Strategy: network-first, falling back to cache when offline.
// Every successful request (the app page itself, fonts, etc.) is cached as it happens,
// so after the first successful load with a connection, the app keeps working offline.
// "Aggiorna app" in Impostazioni does a normal reload, which this strategy always tries
// to serve fresh from the network first — so updates are picked up as soon as there's a connection.

const CACHE_NAME = 'macro-fit-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match('./'))
      )
  );
});
