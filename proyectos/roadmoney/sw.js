const CACHE_NAME = 'roadmoney-v1';
const ASSETS = [
  '/proyectos/roadmoney/',
  '/proyectos/roadmoney/index.html',
  '/proyectos/roadmoney/manifest.json',
  '/proyectos/roadmoney/icons/icon-192.png',
  '/proyectos/roadmoney/icons/icon-512.png',
];

// Install: cache all static assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// Activate: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve from cache, fall back to network
self.addEventListener('fetch', event => {
  if (event.request.url.includes('firebase') ||
      event.request.url.includes('googleapis.com') ||
      event.request.url.includes('gstatic.com')) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (event.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/proyectos/roadmoney/index.html');
        }
      });
    })
  );
});
